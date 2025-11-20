<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Exports\Sheets\SummarySheet;
use App\Exports\Sheets\WatchlistSheet;
use App\Exports\Sheets\AspectQASheet;

class ReportDetailExport implements WithMultipleSheets
{
    protected array $summary;
    protected array $watchlist;
    protected array $actionItems;
    protected array $qaRows;

    public function __construct(array $summary, array $watchlist, array $actionItems, array $qaRows)
    {
        $this->summary = $summary;
        $this->watchlist = $watchlist;
        $this->actionItems = $actionItems;
        $this->qaRows = $qaRows;
    }

    public function sheets(): array
    {
        return [
            new SummarySheet($this->summary),
            new WatchlistSheet($this->watchlist, $this->actionItems),
            new AspectQASheet($this->qaRows),
        ];
    }
}