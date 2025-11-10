<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum PeriodStatus: int
{
    use HasEnumHelpers;

    case DRAFT = 1;
    case ACTIVE = 2;
    case ENDED = 3;
    case EXPIRED = 4;

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Draft',
            self::ACTIVE => 'Aktif',
            self::ENDED => 'Selesai',
            self::EXPIRED => 'Expired',
        };
    }
}