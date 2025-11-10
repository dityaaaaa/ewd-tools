<?php

namespace App\Models;

use App\Traits\HasVisibilityRules;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class QuestionVersion extends Model
{
    use HasFactory, HasVisibilityRules, Auditable;

    protected $fillable = [
        'question_id',
        'aspect_version_id',
        'version_number',
        'question_text',
        'weight',
        'is_mandatory',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'is_mandatory' => 'boolean',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function aspectVersion(): BelongsTo
    {
        return $this->belongsTo(AspectVersion::class);
    }

    public function questionOptions(): HasMany
    {
        return $this->hasMany(QuestionOption::class);
    }

    public function visibilityRules(): MorphMany
    {
        return $this->morphMany(VisibilityRule::class, 'entity');
    }
}
