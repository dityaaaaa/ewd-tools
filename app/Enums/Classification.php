<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum Classification: int
{
    use HasEnumHelpers;

    case WATCHLIST = 0;
    case SAFE = 1;
    
    public function label(): string
    {
        return match($this) {
            self::WATCHLIST => 'Watchlist',
            self::SAFE => 'Safe',
        };
    }
}