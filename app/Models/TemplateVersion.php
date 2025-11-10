<?php

namespace App\Models;

use App\Traits\HasVisibilityRules;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TemplateVersion extends Model
{
    use HasFactory, HasVisibilityRules;

    protected $fillable = [
        'template_id',
        'name',
        'version_number',
        'description',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function aspects(): BelongsToMany
    {
        return $this->belongsToMany(Aspect::class, 'aspect_template_versions')
            ->withPivot('weight')
            ->withTimestamps();
    }

    public function visibilityRules(): MorphMany
    {
        return $this->morphMany(VisibilityRule::class, 'entity');
    }

    /** FUNCTION */
    public function getVisibleAspectGroups(array $borrowerData, array $facilityData): array
    {
        $aspectGroups = [];

        $this->load([
            'aspects.latestAspectVersion.questionVersions.questionOptions',
            'aspects.latestAspectVersion.questionVersions.visibilityRules',
        ]);

        foreach ($this->aspects as $aspect) {
            $questions = $aspect->latestAspectVersion->questionVersions;
            if (! empty($questions)) {
                $aspectGroups[] = [
                    'id' => $aspect->id,
                    'aspect_id' => $aspect->id,
                    'name' => $aspect->name,
                    'description' => $aspect->description,
                    'weight' => $aspect->pivot->weight ?? 0,
                    'aspects' => $questions,
                ];
            }
        }

        return $aspectGroups;
    }
}
