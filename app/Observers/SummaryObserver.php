<?php

namespace App\Observers;

use App\Enums\Classification;
use App\Enums\ReportStatus;
use App\Enums\WatchlistStatus;
use App\Models\MonitoringNote;
use App\Models\ReportSummary;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Auth;

class SummaryObserver
{
    public function saved(ReportSummary $summary): void
    {
        $report = $summary->report;

        if (!$report) {
            return;
        }

        if ($summary->final_classification === Classification::WATCHLIST) {
            $addedBy = Auth::id() ?? $report->created_by;

            $watchlist = Watchlist::firstOrCreate(
                [
                    'borrower_id' => $report->borrower_id,
                    'report_id' => $report->id,
                    'status' => WatchlistStatus::ACTIVE,
                ],
                [
                    'added_by' => $addedBy
                ]
            );

            MonitoringNote::firstOrCreate(
                [
                    'watchlist_id' => $watchlist->id,
                ],
                [
                    'watchlist_reason' => '',
                    'account_strategy' => '',
                    'created_by' => $addedBy,
                ]
            );
        } else {
            Watchlist::where('borrower_id', $report->borrower_id)
                ->where('status', WatchlistStatus::ACTIVE)
                ->update([
                    'status' => WatchlistStatus::ARCHIVED,
                    'resolved_by' => Auth::id(),
                    'resolved_at' => now(),
                ]);
        }
    }
}
