<?php

namespace Database\Seeders;

use App\Enums\ActionItemType;
use App\Enums\WatchlistStatus;
use App\Models\ActionItem;
use App\Models\MonitoringNote;
use App\Models\Report;
use App\Models\User;
use App\Models\Watchlist;
use App\Services\ReportCalculationService;
use Illuminate\Database\Seeder;

class MonitoringNoteSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->role('admin')->first();
        if (! $admin) {
            $this->command?->error('Admin user tidak ditemukan. Pastikan RolePermissionSeeder dan UserSeeder sudah dijalankan.');
            return;
        }

        // Ensure reports have summaries and watchlists created when applicable
        $reports = Report::with(['borrower', 'summary'])->get();
        if ($reports->isEmpty()) {
            $this->command?->warn('No reports found. Run ReportSeeder first.');
            return;
        }

        foreach ($reports as $report) {
            // Recalculate to ensure watchlist is created if needed
            app(ReportCalculationService::class)->calculateAndStoreSummary($report, $admin);

            $watchlist = Watchlist::where('report_id', $report->id)->first();
            if (! $watchlist) {
                // Only create monitoring notes for reports on watchlist
                continue;
            }

            // Create or fetch MonitoringNote
            $monitoringNote = MonitoringNote::firstOrCreate([
                'watchlist_id' => $watchlist->id,
            ], MonitoringNote::factory()->make()->toArray());

            // Create 1 previous, 1 current, 1 next item and chain
            $prev = ActionItem::factory()->create([
                'monitoring_note_id' => $monitoringNote->id,
                'item_type' => ActionItemType::PREVIOUS_PERIOD->value,
            ]);

            $curr = ActionItem::factory()->create([
                'monitoring_note_id' => $monitoringNote->id,
                'item_type' => ActionItemType::CURRENT_PROGRESS->value,
                'previous_action_item_id' => $prev->id,
            ]);

            ActionItem::factory()->create([
                'monitoring_note_id' => $monitoringNote->id,
                'item_type' => ActionItemType::NEXT_PERIOD->value,
                'previous_action_item_id' => $curr->id,
            ]);
        }

        $this->command?->info('Monitoring notes and chained action items seeded for watchlisted reports.');
    }
}