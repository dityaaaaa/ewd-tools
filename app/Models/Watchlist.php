<?php

namespace App\Models;

use App\Enums\WatchlistStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Watchlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrower_id',
        'report_id',
        'status',
        'added_by',
        'resolved_by',
        'resolved_notes',
        'resolved_at',
    ];

    protected $casts = [
        'status' => WatchlistStatus::class,
        'resolved_at' => 'datetime',
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(Borrower::class);
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function monitoringNotes(): HasMany
    {
        return $this->hasMany(MonitoringNote::class);
    }
}
