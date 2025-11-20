<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class SummarySheet implements FromArray, ShouldAutoSize, WithTitle
{
    protected array $summary;

    public function __construct(array $summary)
    {
        $this->summary = $summary;
    }

    public function array(): array
    {
        $rows = [];
        foreach ($this->summary as $label => $value) {
            $rows[] = [$label, is_scalar($value) ? $value : json_encode($value)];
        }
        return $rows;
    }

    public function title(): string
    {
        return 'Summary';
    }
}