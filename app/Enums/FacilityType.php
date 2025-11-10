<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum FacilityType: int
{
    use HasEnumHelpers;
    
    case KIE = 1;
    case KMKE = 2;
    case BOTH = 3;

    public function label(): string
    {
        return match ($this) {
            self::KIE => 'KIE',
            self::KMKE => 'KMKE',
            self::BOTH => 'KIE & KMKE',
        };
    }
}
