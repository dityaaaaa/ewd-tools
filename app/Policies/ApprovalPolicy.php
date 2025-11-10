<?php

namespace App\Policies;

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Models\Approval;
use App\Models\User;

class ApprovalPolicy
{
    public function review(User $user, Approval $approval): bool
    {
        if (!$user->hasRole('risk_analyst')) {
            return false;
        }
        if ($approval->level !== ApprovalLevel::ERO || $approval->status !== ApprovalStatus::PENDING) {
            return false;
        }
        $approval->loadMissing('report.borrower');
        return $this->sameDivision($user, $approval);
    }

    public function approve(User $user, Approval $approval): bool
    {
        if ($approval->status !== ApprovalStatus::PENDING) {
            return false;
        }
        $approval->loadMissing('report.borrower');
        if ($approval->level === ApprovalLevel::KADEPT_BISNIS) {
            return $user->hasRole('kadept_bisnis') && $this->sameDivision($user, $approval);
        }
        if ($approval->level === ApprovalLevel::KADIV_ERO) {
            return $user->hasRole('kadept_risk') && $this->sameDivision($user, $approval);
        }
        return false;
    }

    public function reject(User $user, Approval $approval): bool
    {
        // Same constraints as approve() but allow rejection
        return $this->approve($user, $approval) || $this->review($user, $approval);
    }

    private function sameDivision(User $user, Approval $approval): bool
    {
        $borrowerDivisionId = $approval->report?->borrower?->division_id;
        return $borrowerDivisionId ? (int)$borrowerDivisionId === (int)$user->division_id : true;
    }
}