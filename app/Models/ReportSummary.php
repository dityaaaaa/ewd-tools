<?php

namespace App\Models;

use App\Enums\Classification;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportSummary extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'report_id',
        'final_classification',
        'indicative_collectibility',
        'is_override',
        'override_reason',
        'override_by',
        'business_notes',
        'reviewer_notes',
    ];

    protected $casts = [
        'final_classification' => Classification::class,
        'is_override' => 'boolean',
        'indicative_collectibility' => 'integer',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function overrideBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'override_by');
    }
}
