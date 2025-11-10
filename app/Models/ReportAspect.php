<?php

namespace App\Models;

use App\Enums\Classification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportAspect extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'aspect_version_id',
        'total_score',
        'classification',
    ];

    protected $casts = [
        'classification' => Classification::class,
        'total_score' => 'decimal:2',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function aspectVersion(): BelongsTo
    {
        return $this->belongsTo(AspectVersion::class);
    }
}
