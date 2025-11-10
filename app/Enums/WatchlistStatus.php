<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum WatchlistStatus: int
{
    use HasEnumHelpers;
    
    case ACTIVE = 1;
    case RESOLVED = 2;
    case ARCHIVED = 3;

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::RESOLVED => 'Resolved',
            self::ARCHIVED => 'Archived',
        };
    }
}
