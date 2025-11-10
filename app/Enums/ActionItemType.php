<?php

namespace App\Enums;

enum ActionItemType: int
{
    case PREVIOUS_PERIOD = 0;
    case CURRENT_PROGRESS = 1;
    case NEXT_PERIOD = 2;

    public function label(): string
    {
        return str_replace('_', ' ', (ucwords(strtolower($this->name))));
    }
}
