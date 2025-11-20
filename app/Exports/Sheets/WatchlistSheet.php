<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class WatchlistSheet implements FromArray, ShouldAutoSize, WithTitle
{
    protected array $watchlist;
    protected array $actionItems;

    public function __construct(array $watchlist, array $actionItems)
    {
        $this->watchlist = $watchlist;
        $this->actionItems = $actionItems;
    }

    public function array(): array
    {
        $rows = [];
        $rows[] = ['Watchlist Reason', $this->watchlist['watchlist_reason'] ?? ''];
        $rows[] = ['Account Strategy', $this->watchlist['account_strategy'] ?? ''];

        $rows[] = ['Action Items - Previous Period'];
        foreach (($this->actionItems['previous_period'] ?? []) as $item) {
            $rows[] = [$item['title'] ?? '', $item['progress_notes'] ?? ''];
        }

        $rows[] = ['Action Items - Current Progress'];
        foreach (($this->actionItems['current_progress'] ?? []) as $item) {
            $rows[] = [$item['title'] ?? '', $item['progress_notes'] ?? ''];
        }

        $rows[] = ['Action Items - Next Period'];
        foreach (($this->actionItems['next_period'] ?? []) as $item) {
            $rows[] = [$item['title'] ?? '', $item['progress_notes'] ?? ''];
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Watchlist';
    }
}