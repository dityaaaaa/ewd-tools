<?php

namespace App\Observers;

use App\Models\Report;

class ReportObserver
{
    public function saved(Report $report): void
    {
        $summary = $report->summary;
    }
}
