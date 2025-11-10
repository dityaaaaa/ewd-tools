<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowerFacility extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'borrower_id',
        'facility_name',
        'limit',
        'outstanding',
        'interest_rate',
        'principal_arrears',
        'interest_arrears',
        'pdo_days',
        'maturity_date'
    ];

    protected $casts = [
        'limit' => 'decimal:2',
        'outstanding' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'principal_arrears' => 'decimal:2',
        'interest_arrears' => 'decimal:2',
        'maturity_date' => 'date',
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(Borrower::class);
    }
}
