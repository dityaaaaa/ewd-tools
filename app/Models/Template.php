<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Template extends Model
{
    use HasFactory;

    public function templateVersions(): HasMany
    {
        return $this->hasMany(TemplateVersion::class);
    }

    public function latestTemplateVersion(): HasOne
    {
        return $this->hasOne(TemplateVersion::class)->latestOfMany();
    }

    /** FUNCTION */
    public static function getApplicableTemplateId(array $borrowerData, array $facilityData): ?int
    {
        $templates = self::with('latestTemplateVersion.visibilityRules')->get();

        foreach ($templates as $template) {
            if ($template->latestTemplateVersion && $template->latestTemplateVersion->checkVisibility($borrowerData, $facilityData)) {
                return $template->id;
            }
        }

        return null;
    }
}
