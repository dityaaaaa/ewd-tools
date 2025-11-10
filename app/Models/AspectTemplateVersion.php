<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AspectTemplateVersion extends Model
{
    protected $fillable = [
        'template_version_id',
        'aspect_id',
        'weight',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
    ];

    /**
     * Relasi ke TemplateVersion
     */
    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(TemplateVersion::class);
    }

    /**
     * Relasi ke Aspect
     */
    public function aspect(): BelongsTo
    {
        return $this->belongsTo(Aspect::class);
    }
}