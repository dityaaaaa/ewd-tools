<?php

namespace App\Enums;

enum ApprovalLevel: int
{
    case RM = 1;
    case ERO = 2;
    case KADEPT_BISNIS = 3;
    case KADIV_ERO = 4;

    public function label(): string {
        return match($this) {
            self::RM => 'Relationship Manager',
            self::ERO => 'Risk Analyst',
            self::KADEPT_BISNIS => 'Kadept Bisnis',
            self::KADIV_ERO => 'Kadiv ERO',
        };
    }
}