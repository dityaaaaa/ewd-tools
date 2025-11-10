<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum ActionItemStatus: int
{
    use HasEnumHelpers;

    case PENDING = 0;
    case IN_PROGRESS = 1;
    case COMPLETED = 2;
    case OVERDUE = 3;

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::IN_PROGRESS => 'In Progress',
            self::COMPLETED => 'Completed',
            self::OVERDUE => 'Overdue',
        };
    }
}
