<?php

namespace Database\Seeders;

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Models\Approval;
use App\Models\Report;
use Illuminate\Database\Seeder;

class ApprovalSeeder extends Seeder
{
    /**
     * Seed pipeline approvals across reports to make charts visible.
     */
    public function run(): void
    {
        $reports = Report::inRandomOrder()->limit(30)->get();
        if ($reports->isEmpty()) {
            return;
        }

        foreach ($reports as $report) {
            // Level ERO
            $eroStatus = [ApprovalStatus::PENDING, ApprovalStatus::APPROVED, ApprovalStatus::REJECTED][array_rand([0,1,2])];
            Approval::updateOrCreate(
                ['report_id' => $report->id, 'level' => ApprovalLevel::ERO->value],
                [
                    'status' => $eroStatus->value,
                    'reviewed_by' => null,
                    'notes' => 'Seeded ERO approval',
                ]
            );

            // If ERO approved, escalate to KADEPT BISNIS
            if ($eroStatus === ApprovalStatus::APPROVED) {
                $kadeptStatus = [ApprovalStatus::PENDING, ApprovalStatus::APPROVED, ApprovalStatus::REJECTED][array_rand([0,1,2])];
                Approval::updateOrCreate(
                    ['report_id' => $report->id, 'level' => ApprovalLevel::KADEPT_BISNIS->value],
                    [
                        'status' => $kadeptStatus->value,
                        'reviewed_by' => null,
                        'notes' => 'Seeded KADEPT BISNIS approval',
                    ]
                );

                // If KADEPT approved, escalate to KADIV ERO
                if ($kadeptStatus === ApprovalStatus::APPROVED) {
                    $kadivStatus = [ApprovalStatus::PENDING, ApprovalStatus::APPROVED, ApprovalStatus::REJECTED][array_rand([0,1,2])];
                    Approval::updateOrCreate(
                        ['report_id' => $report->id, 'level' => ApprovalLevel::KADIV_ERO->value],
                        [
                            'status' => $kadivStatus->value,
                            'reviewed_by' => null,
                            'notes' => 'Seeded KADIV ERO approval',
                        ]
                    );
                }
            }
        }
    }
}