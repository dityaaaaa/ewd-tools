<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum ReportStatus: int
{
    use HasEnumHelpers;

    case DRAFT = 0;
    case SUBMITTED = 1;
    case REVIEWED = 2;
    case APPROVED = 3;
    case REJECTED = 4;
    case DONE = 5;

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::REVIEWED => 'Reviewed',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::DONE => 'Done',
        };
    }
}
