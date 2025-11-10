<?php

namespace App\Models;

use App\Enums\ReportStatus;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Report extends Model
{
    use HasFactory, Auditable;
    
    protected $fillable = [
        'borrower_id',
        'period_id',
        'template_id',
        'status',
        'submitted_at',
        'rejection_reason',
        'created_by',
    ];

    protected $casts = [
        'status' => ReportStatus::class,
        'submitted_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => ReportStatus::SUBMITTED->value,
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(Borrower::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

     public function summary(): HasOne
    {
        return $this->hasOne(ReportSummary::class);
    }

    public function aspects(): HasMany
    {
        return $this->hasMany(ReportAspect::class);
    }

    public function watchlist(): HasOne
    {
        return $this->hasOne(Watchlist::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }   

    public function audits(): HasMany
    {
        return $this->hasMany(ReportAudit::class)->latest();
    }
}
