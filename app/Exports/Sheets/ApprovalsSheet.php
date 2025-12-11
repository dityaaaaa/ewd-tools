<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ApprovalsSheet implements FromArray, ShouldAutoSize, WithTitle, WithHeadings
{
    protected array $approvals;

    public function __construct(array $approvals)
    {
        $this->approvals = $approvals;
    }

    public function array(): array
    {
        return $this->approvals;
    }

    public function headings(): array
    {
        return ['Level', 'Approver Name', 'Status', 'Approved At', 'Notes'];
    }

    public function title(): string
    {
        return 'Approvals';
    }
}
