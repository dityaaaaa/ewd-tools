<?php

namespace App\Enums;

use App\Traits\HasEnumHelpers;

enum ApprovalStatus: int
{
    use HasEnumHelpers;
    
    case PENDING = 0;
    case APPROVED = 1;
    case REJECTED = 2;

    public function label(): string {
        return ucfirst(strtolower($this->name));
    }
}
