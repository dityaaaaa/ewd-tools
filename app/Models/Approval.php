<?php

namespace App\Models;

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Approval extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'report_id',
        'reviewed_by',
        'level',
        'status',
        'notes',
    ];

    protected $casts = [
        'level'  => ApprovalLevel::class,
        'status' => ApprovalStatus::class,
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function audits()
    {
        return $this->hasMany(ReportAudit::class, 'approval_id');
    }
}
