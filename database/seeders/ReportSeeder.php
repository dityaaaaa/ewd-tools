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

        // Ambil 2 periode terakhir untuk membuat laporan periode sebelumnya dan saat ini
        $periods = Period::query()->orderBy('start_date')->get();
        if ($periods->isEmpty()) {
            $this->command?->warn('No period found. Run PeriodSeeder first.');
            return;
        }
        $targetPeriods = $periods->count() >= 2
            ? $periods->slice(-2) // dua periode terakhir (periode sebelumnya dan saat ini)
            : $periods;           // fallback jika hanya satu periode tersedia

        $template = Template::query()->first();
        if (!$template) {
            $this->command?->warn('No templates found. Run TemplateSeeder first.');
            return;
        }

        // Buat laporan untuk semua debitur dari setiap divisi
        $borrowers = Borrower::query()->get();
        if ($borrowers->isEmpty()) {
            $this->command?->warn('No borrowers found. Run BorrowerSeeder first.');
            return;
        }

        DB::transaction(function () use ($borrowers, $targetPeriods, $template, $admin) {
            foreach ($borrowers as $borrower) {
                foreach ($targetPeriods as $period) {
                    $report = Report::firstOrCreate([
                        'borrower_id' => $borrower->id,
                        'period_id' => $period->id,
                        'template_id' => $template->id,
                    ], [
                        'status' => ReportStatus::SUBMITTED->value,
                        'submitted_at' => now(),
                        'created_by' => $admin->id,
                    ]);

                    // Buat jalur approval pending (memicu audit via Auditable)
                    foreach ([ApprovalLevel::ERO, ApprovalLevel::KADEPT_BISNIS, ApprovalLevel::KADIV_ERO] as $level) {
                        Approval::firstOrCreate([
                            'report_id' => $report->id,
                            'level' => $level->value,
                        ], [
                            'status' => ApprovalStatus::PENDING->value,
                        ]);
                    }

                    // Simulasi perubahan untuk menghasilkan audit 'updated'
                    $report->update(['rejection_reason' => null]);

                    // Hitung ringkasan awal agar tidak null pada UI
                    app(ReportCalculationService::class)->calculateAndStoreSummary($report, $admin);
                }
            }
        });
    }
}