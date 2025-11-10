<?php

namespace App\Models;

use App\Traits\HasVisibilityRules;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class AspectVersion extends Model
{
    use HasFactory, HasVisibilityRules, Auditable;

    protected $fillable = [
        'aspect_id',
        'version_number',
        'name',
        'description',
    ];

    public function aspect(): BelongsTo
    {
        return $this->belongsTo(Aspect::class);
    }

    public function questionVersions(): HasMany
    {
        return $this->hasMany(QuestionVersion::class);
    }

    public function visibilityRules(): MorphMany
    {
        return $this->morphMany(VisibilityRule::class, 'entity');
    }

    /** FUNCTION */
    public function getVisibleQuestions(array $borrowerData = [], array $facilityData = []): array
    {
        $questions = [];
        foreach ($this->questionVersions as $question) {
            if ($question->checkVisibility($borrowerData, $facilityData)) {
                $questions[] = [
                    'id' => $question->id,
                    'question_id' => $question->question_id,
                    'version_number' => $question->version_number,
                    'question_text' => $question->question_text,
                    'weight' => $question->weight,
                    'is_mandatory' => $question->is_mandatory,
                    'options' => $question->questionOptions->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'option_text' => $option->option_text,
                            'score' => $option->score,
                        ];
                    })->toArray(),
                    'visibility_rules' => $question->visibilityRules,
                ];
            }
        }

        return $questions;
    }
}
