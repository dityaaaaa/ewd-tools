<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AspectQASheet implements FromArray, ShouldAutoSize, WithTitle, WithHeadings
{
    protected array $rows;

    public function __construct(array $rows)
    {
        $this->rows = $rows;
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return ['Aspect Code', 'Aspect Name', 'Question', 'Selected Option', 'Score', 'Notes'];
    }

    public function title(): string
    {
        return 'Aspect Q&A';
    }
}