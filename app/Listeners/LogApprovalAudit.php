<?php

namespace App\Listeners;

use App\Models\ReportAudit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class LogApprovalAudit implements ShouldQueue
{
    use InteractsWithQueue;
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $approval = $event->approval;
        $action = match ($approval->status) {
            1 => 'approved',
            2 => 'rejected',
            default => 'pending',
        };

        ReportAudit::create([
            'auditable_id'   => $approval->id,
            'auditable_type' => get_class($approval),
            'report_id'      => $approval->report_id,
            'user_id'        => Auth::id(),
            'action'         => $action,
            'level'          => $approval->level->value, // Convert enum to integer value
            'approval_id'    => $approval->id,
            'before'         => null,
            'after'          => json_encode(['status' => $action]),
            'source'         => 'UI',
        ]);
    }
}
