<?php

namespace App\Models;

use App\Enums\ActionItemType;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonitoringNote extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'watchlist_id',
        'watchlist_reason',
        'account_strategy',
        'created_by',
        'updated_by',
    ];

    public function watchlist(): BelongsTo
    {
        return $this->belongsTo(Watchlist::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function actionItems(): HasMany
    {
        return $this->hasMany(ActionItem::class);
    }

    public function previousPeriodItems(): HasMany
    {
        return $this->hasMany(ActionItem::class)->where('item_type', ActionItemType::PREVIOUS_PERIOD->value);
    }

    public function currentPeriodItems(): HasMany
    {
        return $this->hasMany(ActionItem::class)->where('item_type', ActionItemType::CURRENT_PROGRESS->value);
    }

    public function nextPeriodItems(): HasMany
    {
        return $this->hasMany(ActionItem::class)->where('item_type', ActionItemType::NEXT_PERIOD->value);
    }
}
