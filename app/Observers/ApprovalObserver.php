<?php

namespace App\Observers;

use App\Enums\ApprovalStatus;
use App\Models\Approval;
use App\Models\ReportAudit;
use Illuminate\Support\Facades\Auth;

class ApprovalObserver
{
    /**
     * Handle the Approval "created" event.
     */
    public function created(Approval $approval): void
    {
        //
    }

    /**
     * Handle the Approval "updated" event.
     */
    public function updated(Approval $approval): void
    {
        //
    }

    /**
     * Handle the Approval "deleted" event.
     */
    public function deleted(Approval $approval): void
    {
        //
    }

    /**
     * Handle the Approval "restored" event.
     */
    public function restored(Approval $approval): void
    {
        //
    }

    /**
     * Handle the Approval "force deleted" event.
     */
    public function forceDeleted(Approval $approval): void
    {
        //
    }
}
