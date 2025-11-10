<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function submit(User $user, Report $report): bool
    {
        if (!$user->hasRole('relationship_manager')) {
            return false;
        }

        // Optional division constraint: RM must belong to borrower's division
        $report->loadMissing('borrower');
        if ($report->borrower && $user->division_id && $report->borrower->division_id) {
            return (int)$user->division_id === (int)$report->borrower->division_id;
        }

        return true;
    }

    public function override(User $user, Report $report): bool
    {
        return $user->hasRole('admin');
    }
}