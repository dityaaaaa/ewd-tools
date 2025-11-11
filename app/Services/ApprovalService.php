<?php

namespace App\Services;

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Enums\Classification;
use App\Models\Approval;
use App\Models\Report;
use App\Enums\ReportStatus;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class ApprovalService extends BaseService
{
    /**
     * Helper: expected report status before a given approval level can process
     */
    public function getExpectedReportStatusForLevel(ApprovalLevel $attemptingLevel): ReportStatus
    {
        return match ($attemptingLevel) {
            ApprovalLevel::ERO => ReportStatus::SUBMITTED,
            ApprovalLevel::KADEPT_BISNIS => ReportStatus::REVIEWED,
            ApprovalLevel::KADIV_ERO => ReportStatus::APPROVED,
            default => throw new InvalidArgumentException('Level approval tidak valid.'),
        };
    }

    /**
     * Assert the actor and report are eligible to process the given approval level
     */
    public function assertCanProcess(User $actor, Report $report, ApprovalLevel $level): void
    {
        $this->validateActorPermission($actor, $level);
        $this->validateSequentialFlow($report, $level);
    }

    public function processApproval(Approval $approval, User $actor, ApprovalStatus $status, array $data): Approval
    {
        $this->validateActorPermission($actor, $approval->level);

        $report = $approval->report;
        $this->validateSequentialFlow($report, $approval->level);

        if ($approval->status !== ApprovalStatus::PENDING) {
            throw new AuthorizationException("Approval ini sudah diproses (status: {$approval->status->name}).");
        }

        return $this->tx(function () use ($approval, $report, $actor, $status, $data) {
            // Simpan status lama sebelum diubah, untuk kebutuhan audit
            $previousStatus = $report->status; // casted ke ReportStatus
            $approval->update([
                'reviewed_by' => $actor->id,
                'status' => $status,
                'notes' => $data['notes'] ?? null,
            ]);

            $nextReportStatus = $this->determineNextReportStatus($report, $approval->level, $status);
            $report->status = $nextReportStatus;

            if ($nextReportStatus === ReportStatus::REJECTED) {
                $report->rejection_reason = $data['notes'] ?? 'Ditolak tanpa alasan spesifik.';
            }

            $report->save();

            if ($approval->level === ApprovalLevel::ERO && $status === ApprovalStatus::APPROVED && isset($data['final_classification'])) {
                $report->loadMissing('summary');
                $report->summary->update([
                    'final_classification' => Classification::tryFrom($data['final_classification']),
                    'override_reason' => $data['override_reason'] ?? null,
                    'is_override' => true,
                ]);
            }

            if (isset($data['business_notes']) || isset($data['reviewer_notes'])) {
                $report->loadMissing('summary');
                $updateData = [];
                if (isset($data['business_notes'])) $updateData['business_notes'] = $data['business_notes'];
                if (isset($data['reviewer_notes'])) $updateData['reviewer_notes'] = $data['reviewer_notes'];
                $report->summary->update($updateData);
            }

            $this->audit($actor, [
                'action' => $status === ApprovalStatus::APPROVED ? 'approved' : 'rejected',
                'auditable_id' => $report->id,
                'auditable_type' => Report::class,
                'report_id' => $report->id,
                'approval_id' => $approval->id,
                'level' => $approval->level->value,
                // Pastikan before/after berupa angka mentah dari enum
                'before' => ['report_status' => $previousStatus?->value],
                'after' => ['report_status' => $nextReportStatus?->value],
                'meta' => $data,
            ]);

            return $approval;
        });
    }

    public function createPendingApprovals(Report $report): void
    {
        $this->tx(function () use ($report) {
            $report->approvals()->delete();

            $levels = [
                ApprovalLevel::ERO,
                ApprovalLevel::KADEPT_BISNIS,
                ApprovalLevel::KADIV_ERO,
            ];

            foreach ($levels as $level) {
                $report->approvals()->create([
                    'level' => $level,
                    'status' => ApprovalStatus::PENDING,
                ]);
            }
        });
    }

    public function resetApprovals(Report $report): void
    {
        $this->tx(function () use ($report) {
            $report->approvals()->delete();
        });
    }

    protected function validateActorPermission(User $actor, ApprovalLevel $level): void
    {
        $expectedRole = match ($level) {
            ApprovalLevel::ERO => 'risk_analyst',
            ApprovalLevel::KADEPT_BISNIS => 'kadept_bisnis',
            ApprovalLevel::KADIV_ERO => 'kadept_risk',
            default => throw new InvalidArgumentException('Level approval tidak dikenali.'),
        };

        if (!$actor->hasRole($expectedRole)) {
            throw new AuthorizationException("Anda tidak memiliki peran ({$expectedRole}) untuk persetujuan level {$level->name}.");
        }
    }

    protected function validateSequentialFlow(Report $report, ApprovalLevel $attemptingLevel): void
    {
        $expectedStatus = $this->getExpectedReportStatusForLevel($attemptingLevel);

        if ($report->status !== $expectedStatus) {
            throw new InvalidArgumentException("Status laporan saat ini ({$report->status->name}) tidak valid untuk persetujuan level {$attemptingLevel->name}. Seharusnya {$expectedStatus->name}.");
        }

        $report->loadMissing('approvals');

        if ($attemptingLevel === ApprovalLevel::KADEPT_BISNIS) {
            $eroApproved = $report->approvals
                ->where('level', ApprovalLevel::ERO)
                ->where('status', ApprovalStatus::APPROVED)
                ->isNotEmpty();
            if (!$eroApproved) {
                throw new AuthorizationException('Laporan ini harus disetujui oleh Risk Analyst (ERO) terlebih dahulu.');
            }
        }

        if ($attemptingLevel === ApprovalLevel::KADIV_ERO) {
            $kadeptApproved = $report->approvals
                ->where('level', ApprovalLevel::KADEPT_BISNIS)
                ->where('status', ApprovalStatus::APPROVED)
                ->isNotEmpty();
            if (!$kadeptApproved) {
                throw new AuthorizationException('Laporan ini harus disetujui oleh Kadept Bisnis terlebih dahulu.');
            }
        }
    }

    protected function determineNextReportStatus(Report $report, ApprovalLevel $level, ApprovalStatus $status): ReportStatus
    {
        if ($status === ApprovalStatus::REJECTED) {
            return ReportStatus::REJECTED;
        }

        return match ($level) {
            ApprovalLevel::ERO => ReportStatus::REVIEWED,
            ApprovalLevel::KADEPT_BISNIS => ReportStatus::APPROVED,
            ApprovalLevel::KADIV_ERO => ReportStatus::DONE,
            default => $report->status
        };
    }
}