<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VisibilityRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_type',
        'entity_id', 
        'description',
        'source_type',
        'source_field',
        'operator',
        'value'
    ];

    public function entity(): MorphTo
    {
        return $this->morphTo();
    }
}
