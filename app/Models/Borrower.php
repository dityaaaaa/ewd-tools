<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Borrower extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'division_id'];

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function detail(): HasOne
    {
        return $this->hasOne(BorrowerDetail::class);
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(BorrowerFacility::class);
    }
}
