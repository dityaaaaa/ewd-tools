<?php

namespace App\Models;

use App\Enums\FacilityType;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowerDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'borrower_id',
        'borrower_group',
        'purpose',
        'economic_sector',
        'business_field',
        'borrower_business',
        'collectibility',
        'restructuring',
    ];

    protected $casts = [
        'purpose' => FacilityType::class,
        'restructuring' => 'boolean',
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(Borrower::class);
    }
}
