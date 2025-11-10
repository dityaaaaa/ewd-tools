<?php

namespace Database\Seeders;

use App\Enums\ReportStatus;
use App\Models\Approval;
use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Models\Borrower;
use App\Models\Period;
use App\Models\Report;
use App\Models\Template;
use App\Models\User;
use App\Services\ReportCalculationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil admin via role untuk menghindari ketergantungan pada email tertentu
        $admin = User::query()->role('admin')->first();
        if (!$admin) {
            $this->command?->warn('Admin user dengan role admin tidak ditemukan. Jalankan RolePermissionSeeder dan Admin/UserSeeder terlebih dahulu.');
            return;
        }

        // Ambil satu periode yang tersedia; tidak bergantung pada nama tertentu
        $period = Period::query()->orderBy('start_date')->first();
        if (!$period) {
            $this->command?->warn('No period found. Run PeriodSeeder first.');
            return;
        }

        $template = Template::query()->first();
        if (!$template) {
            $this->command?->warn('No templates found. Run TemplateSeeder first.');
            return;
        }

        $borrowers = Borrower::query()->limit(3)->get();
        if ($borrowers->isEmpty()) {
            $this->command?->warn('No borrowers found. Run BorrowerSeeder first.');
            return;
        }

        DB::transaction(function () use ($borrowers, $period, $template, $admin) {
            foreach ($borrowers as $borrower) {
                $report = Report::firstOrCreate([
                    'borrower_id' => $borrower->id,
                    'period_id' => $period->id,
                    'template_id' => $template->id,
                ], [
                    'status' => ReportStatus::SUBMITTED->value,
                    'submitted_at' => now(),
                    'created_by' => $admin->id,
                ]);

                // Create pending approvals (will trigger audits via Auditable)
                foreach ([ApprovalLevel::ERO, ApprovalLevel::KADEPT_BISNIS, ApprovalLevel::KADIV_ERO] as $level) {
                    Approval::firstOrCreate([
                        'report_id' => $report->id,
                        'level' => $level->value,
                    ], [
                        'status' => ApprovalStatus::PENDING->value,
                    ]);
                }

                // Simulate an update on the report to generate an 'updated' audit
                $report->update(['rejection_reason' => null]);

                // Generate calculated summary to avoid null summary on UI
                app(ReportCalculationService::class)->calculateAndStoreSummary($report, $admin);
            }
        });
    }
}