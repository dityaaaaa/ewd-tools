<?php

namespace App\Services;

use App\Data\AspectScoreDto;
use App\Data\OverallSummaryDto;
use App\Enums\Classification;
use App\Enums\WatchlistStatus;
use App\Models\Report;
use App\Models\ReportAspect;
use App\Models\ReportSummary;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class ReportCalculationService extends BaseService
{
    public function calculateAndStoreSummary(Report $report, ?User $actor = null): Report
    {
        return $this->tx(function () use ($report, $actor) {
            $report->loadMissing([
                'borrower.detail',
                'borrower.facilities',
                'template.latestTemplateVersion.aspects.latestAspectVersion.visibilityRules',
                'template.latestTemplateVersion.aspects.latestAspectVersion.questionVersions.questionOptions',
                'template.latestTemplateVersion.aspects.latestAspectVersion.questionVersions.visibilityRules',
                'answers.questionVersion',
                'answers.questionOption',
                'answers.questionVersion.visibilityRules',
            ]);

            [$borrowerData, $facilityData] = $this->extractContextData($report);

            $aspectWeightMap = $this->buildAspectWeightMap($report, $borrowerData, $facilityData);

            $aspectScores = $this->calculateAspectScores(
                $report->answers,
                $borrowerData,
                $facilityData,
                $report->template?->latestTemplateVersion
            );

            $overallSummary = $this->calculateOverallSummary(
                $aspectScores,
                $aspectWeightMap,
                $report->answers,
                $report->borrower->detail->collectibility ?? null,
                $borrowerData,
                $facilityData,
            );

            $this->storeCalculationResults($report, $aspectScores, $overallSummary);

            $this->audit($actor, [
                'action' => 'recalculated',
                'auditable_id' => $report->summary->id,
                'auditable_type' => ReportSummary::class,
                'report_id' => $report->id,
                'meta' => [
                    'total_score' => $overallSummary->totalScore,
                    'classification' => $overallSummary->finalClassification->name,
                ]
            ]);

            if ($overallSummary->finalClassification === Classification::WATCHLIST) {
                $this->createOrAttachWatchlist($report);
            }

            return $report->fresh(['summary', 'aspects']);
        });
    }

    /**
     * Membuat peta sederhana [aspect_version_id => weight] untuk pencarian cepat.
     */
    private function buildAspectWeightMap(Report $report, array $borrowerData, array $facilityData): array
    {
        if (!$report->template || !$report->template->latestTemplateVersion) {
            throw new InvalidArgumentException("Laporan #{$report->id} tidak memiliki template atau versi template yang aktif");
        }

        $map = [];
        foreach ($report->template->latestTemplateVersion->aspects as $aspect) {
            $aspectVersion = $aspect->latestAspectVersion;
            if (!$aspectVersion) continue;

            if (method_exists($aspectVersion, 'checkVisibility') && !$aspectVersion->checkVisibility($borrowerData, $facilityData)) {
                continue;
            }

            $map[$aspectVersion->id] = $aspect->pivot->weight ?? 0;
        }

        return $map;
    }

    /**
     * Hitung skor untuk setiap aspek berdasarkan jawaban.
     * Kembalikan koleksi DTO.
     */
    private function calculateAspectScores(Collection $answers, array $borrowerData, array $facilityData, ?\App\Models\TemplateVersion $templateVersion = null): SupportCollection
    {
        $visibleAnswers = $answers->filter(function ($answer) use ($borrowerData, $facilityData) {
            $qv = $answer->questionVersion;
            if (!$qv) return false;
            if (method_exists($qv, 'checkVisibility')) {
                return $qv->checkVisibility($borrowerData, $facilityData);
            }
            return true;
        });

        $answersByAspect = $visibleAnswers->groupBy('questionVersion.aspectVersion.id');

        // Build map of all questions per visible aspect from template version
        $allQuestionsByAspect = [];
        if ($templateVersion) {
            foreach ($templateVersion->aspects as $aspect) {
                $aspectVersion = $aspect->latestAspectVersion;
                if (!$aspectVersion) { continue; }
                if (method_exists($aspectVersion, 'checkVisibility') && !$aspectVersion->checkVisibility($borrowerData, $facilityData)) {
                    continue; // skip aspects hidden by visibility rules
                }
                $allQuestionsByAspect[$aspectVersion->id] = $aspectVersion->questionVersions;
            }
        }

        return $answersByAspect->map(function ($aspectAnswers, $aspectVersionId) use ($allQuestionsByAspect, $borrowerData, $facilityData) {
            $totalScore = 0;

            foreach ($aspectAnswers as $answer) {
                $questionWeight = ($answer->questionVersion->weight ?? 0) / 100;
                $optionScore = $answer->questionOption->score ?? 0;
                $totalScore += $questionWeight * $optionScore;
            }

            // Add max-score contribution for hidden questions (do not appear due to visibility)
            if (isset($allQuestionsByAspect[$aspectVersionId])) {
                foreach ($allQuestionsByAspect[$aspectVersionId] as $questionVersion) {
                    // If question is NOT visible, add weighted max option score
                    $isVisible = method_exists($questionVersion, 'checkVisibility')
                        ? $questionVersion->checkVisibility($borrowerData, $facilityData)
                        : true;
                    if (!$isVisible) {
                        $questionWeight = ($questionVersion->weight ?? 0) / 100;
                        $maxOptionScore = $questionVersion->questionOptions->max('score');
                        if ($maxOptionScore === null) { // safe fallback
                            $maxOptionScore = 100;
                        }
                        $totalScore += $questionWeight * $maxOptionScore;
                    }
                }
            }

            $totalScore = round($totalScore, 2);

            return new AspectScoreDto(
                aspectVersionId: (int) $aspectVersionId,
                totalScore: $totalScore,
                classification: $this->determineAspectClassification($totalScore)
            );
        });
    }

    /**
     * Tentukan klasifikasi hanya untuk satu aspek (logika terpisah).
     */
    private function determineAspectClassification(float $totalScore): Classification
    {
        return $this->passesScoreRule($totalScore) ? Classification::SAFE : Classification::WATCHLIST;
    }

    /**
     * Hitung skor dan klasifikasi kebutuhan.
     * Mengembalikan sebuah DTO.
     */
    private function calculateOverallSummary(
        SupportCollection $aspectScores,
        array $aspectWeightMap,
        Collection $answers,
        ?string $collectibility,
        array $borrowerData,
        array $facilityData,
    ): OverallSummaryDto {
        $totalWeightedScore = 0;

        foreach ($aspectScores as $aspectVersionId => $scoreData) {
            $aspectWeight = $aspectWeightMap[$aspectVersionId] ?? 0;
            $totalWeightedScore += ($scoreData->totalScore * $aspectWeight / 100);
        }

        $totalScore = round($totalWeightedScore, 2);

        $finalClassification = $this->determineFinalClassification($totalScore, $aspectScores, $answers, $borrowerData, $facilityData);

        return new OverallSummaryDto(
            totalScore: $totalScore,
            finalClassification: $finalClassification,
            collectibility: $collectibility,
        );
    }

    /**
     * Simpan hasil kalkulasi dari DTO ke database.
     */
    private function storeCalculationResults(Report $report, SupportCollection $aspectScores, OverallSummaryDto $overallSummary): void
    {
        foreach ($aspectScores as $scoreData) {
            ReportAspect::updateOrCreate(
                ['report_id' => $report->id, 'aspect_version_id' => $scoreData->aspectVersionId],
                [
                    'total_score' => $scoreData->totalScore,
                    'classification' => $scoreData->classification,
                ]
            );
        }

        ReportSummary::updateOrCreate(
            ['report_id' => $report->id],
            [
                'final_classification' => $overallSummary->finalClassification,
                'indicative_collectibility' => $overallSummary->collectibility ?? 0,
            ]
        );
    }

    // --- LOGIKA PENENTUAN KLASIFIKASI (DI-REFAKTOR) ---

    /**
     * Menentukan klasifikasi final berdasarkan semua aturan.
     * Ini adalah perbaikan LOGIKA KRITIS.
     */
    private function determineFinalClassification(float $totalScore, SupportCollection $aspectScores, Collection $answers, array $borrowerData, array $facilityData): Classification
    {
        if ($this->passesScoreRule($totalScore)
            && $this->passesAspectRule($aspectScores) // <-- Gunakan skor BARU
            && $this->passesMandatoryRule($answers, $borrowerData, $facilityData)) { // <-- Hanya cek pertanyaan mandatory yang terlihat
            return Classification::SAFE;
        }

        return Classification::WATCHLIST;
    }

    private function passesScoreRule(float $totalScore): bool
    {
        return $totalScore >= 80;
    }

    private function passesAspectRule(SupportCollection $aspectScores): bool
    {
        return !$aspectScores->contains(
            fn (AspectScoreDto $aspect) => $aspect->classification === Classification::WATCHLIST
        );
    }

    /**
     * Periksa aturan wajib dari data $answers mentah.
     */
    private function passesMandatoryRule(Collection $answers, array $borrowerData, array $facilityData): bool
    {
        $mandatoryLimit = 1;

        $failedMandatoryCount = $answers
            ->filter(function ($answer) use ($borrowerData, $facilityData) {
                $qv = $answer->questionVersion;
                if (!$qv) return false;
                if (!$qv->is_mandatory) return false;
                if (method_exists($qv, 'checkVisibility') && !$qv->checkVisibility($borrowerData, $facilityData)) {
                    return false; // Abaikan pertanyaan mandatory yang tidak terlihat
                }
                return !$answer->questionOption || ($answer->questionOption->score ?? 0) < 0;
            })
            ->count();

        return $failedMandatoryCount <= $mandatoryLimit;
    }

    /**
     * Ekstrak data konteks untuk evaluasi visibility: borrower_detail + borrower_facility[]
     */
    private function extractContextData(Report $report): array
    {
        $borrowerData = $report->borrower?->detail ? $report->borrower->detail->toArray() : [];
        $facilityData = $report->borrower?->facilities ? $report->borrower->facilities->map(fn($f) => $f->toArray())->all() : [];

        return [$borrowerData, $facilityData];
    }

    // --- LOGIC SIDE-EFFECT

    /**
     * Buat atau lampirkan Watchlist, dipicu oleh Aktor.
     */
    private function createOrAttachWatchlist(Report $report, ?User $actor = null): Watchlist
    {
        $existing = Watchlist::where('borrower_id', $report->borrower_id)
            ->where('status', WatchlistStatus::ACTIVE)
            ->first();

        if ($existing) {
            return $existing;
        }

        $watchlist = Watchlist::create([
            'borrower_id' => $report->borrower_id,
            'report_id' => $report->id,
            'status' => WatchlistStatus::ACTIVE,
            'added_by' => $actor?->id,
        ]);

        $this->audit($actor, [
            'action' => 'created-from-calculation',
            'auditable_id' => $watchlist->id,
            'auditable_type' => Watchlist::class,
            'report_id' => $report->id,
            'meta' => [
                'report_id' => $report->id,
            ]
        ]);

        return $watchlist;
    }
}