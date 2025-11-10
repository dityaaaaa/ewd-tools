<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use Auditable;

    public function questionVersions(): HasMany
    {
        return $this->hasMany(QuestionVersion::class);
    }
}
