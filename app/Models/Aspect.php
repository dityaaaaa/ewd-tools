<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Aspect extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'code',
    ];

    public function aspectVersions(): HasMany
    {
        return $this->hasMany(AspectVersion::class);
    }

    public function latestAspectVersion(): HasOne
    {
        return $this->hasOne(AspectVersion::class)->latestOfMany();
    }

    public function templateVersions(): BelongsToMany
    {
        return $this->belongsToMany(TemplateVersion::class, 'aspect_template_versions')->withPivot('weight')->withTimestamps();
    }
}
