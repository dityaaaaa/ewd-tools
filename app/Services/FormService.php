<?php

namespace App\Services;

use App\Models\Answer;
use App\Models\BorrowerDetail;
use App\Models\BorrowerFacility;
use App\Models\Report;
use App\Enums\ReportStatus;
use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FormService extends BaseService
{
    protected ReportCalculationService $reportCalculationService;
    protected ApprovalService $approvalService;

    public function __construct(
        ReportCalculationService $reportCalculationService,
        ApprovalService $approvalService
    ) {
        $this->reportCalculationService = $reportCalculationService;
        $this->approvalService = $approvalService;
    }

    public function getFormTemplateData(array $borrowerData, array $facilityData): array
    {
        $finalTemplateId = Template::getApplicableTemplateId($borrowerData, $facilityData);
        $aspectGroups = [];

        if ($finalTemplateId) {
            $template = Template::with([
                'latestTemplateVersion.aspects.latestAspectVersion.questionVersions.questionOptions',
                'latestTemplateVersion.aspects.latestAspectVersion.questionVersions.visibilityRules',
                'latestTemplateVersion.aspects.latestAspectVersion.visibilityRules',
                'latestTemplateVersion.visibilityRules',
            ])->find($finalTemplateId);

            if ($template && $template->latestTemplateVersion) {
                $aspectGroups = $template->latestTemplateVersion->getVisibleAspectGroups($borrowerData, $facilityData);
            }
        }

        return [
            'template_id' => $finalTemplateId,
            'aspect_groups' => $aspectGroups,
        ];
    }

    public function submit(array $validated, User $actor): Report
    {
        $this->authorize($actor, 'submit report');

        return $this->tx(function () use ($validated, $actor) {
            $borrowerId = $validated['informationBorrower']['borrowerId'];

            $this->updateBorrowerDetails($borrowerId, $validated['informationBorrower']);
            $this->syncBorrowerFacilities($borrowerId, $validated['facilitiesBorrower']);

            $report = $this->createReport($borrowerId, $validated['reportMeta'], $actor);
            $this->storeReportAnswers($report, $validated['aspectsBorrower']);

            $this->reportCalculationService->calculateAndStoreSummary($report, $actor);

            $this->approvalService->createPendingApprovals($report);

            $this->audit($actor, [
                'action' => 'form_submitted',
                'auditable_id' => $report->id,
                'auditable_type' => Report::class,
                'report_id' => $report->id,
                'meta' => [
                    'borrower_id' => $borrowerId,
                    'borrower_name' => $validated['informationBorrower']['borrowerName'] ?? null,
                    'template_id' => $validated['reportMeta']['template_id'],
                    'period_id' => $validated['reportMeta']['period_id'],
                ]
            ]);

            return $report->fresh(['summary', 'aspects']);
        });
    }

    /**
     * Buat atau perbarui detail data borrower.
     */
    private function updateBorrowerDetails(int $borrowerId, array $info): void
    {
        BorrowerDetail::updateOrCreate( //
            ['borrower_id' => $borrowerId],
            [
                'borrower_group' => $info['borrowerGroup'] ?? null,
                'purpose' => $info['purpose'],
                'economic_sector' => $info['economicSector'],
                'business_field' => $info['businessField'],
                'borrower_business' => $info['borrowerBusiness'],
                'collectibility' => $info['collectibility'],
                'restructuring' => $info['restructuring'],
            ]
        );
    }

    /**
     * Sinkronkan data fasilitas borrower (Delete all + Mass Insert).
     */
    private function syncBorrowerFacilities(int $borrowerId, array $facilities): void
    {
        $facilityData = collect($facilities)->map(fn ($facility) => [
            'borrower_id' => $borrowerId,
            'facility_name' => $facility['name'],
            'limit' => $facility['limit'],
            'outstanding' => $facility['outstanding'],
            'interest_rate' => $facility['interestRate'],
            'principal_arrears' => $facility['principalArrears'],
            'interest_arrears' => $facility['interestArrears'],
            'pdo_days' => $facility['pdo'],
            'maturity_date' => $facility['maturityDate'],
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        BorrowerFacility::where('borrower_id', $borrowerId)->delete();

        if (!empty($facilityData)) {
            BorrowerFacility::insert($facilityData);
        }
    }

    /**
     * Buat data report utama
     */
    private function createReport(int $borrowerId, array $meta, User $actor): Report
    {
        return Report::create([
            'borrower_id' => $borrowerId,
            'template_id' => $meta['template_id'],
            'period_id' => $meta['period_id'],
            'status' => ReportStatus::SUBMITTED,
            'created_by' => $actor->id,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Simpan semua jawaban aspek (Mass Insert).
     */
    private function storeReportAnswers(Report $report, array $answers): void
    {
        $answerData = collect($answers)->map(fn ($answer) => [
            'report_id' => $report->id,
            'question_version_id' => $answer['questionId'],
            'question_option_id' => $answer['selectedOptionId'],
            'notes' => $answer['notes'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        if (!empty($answerData)) {
            Answer::insert($answerData);
        }
    }
}