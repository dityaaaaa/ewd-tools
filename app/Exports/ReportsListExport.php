<?php

namespace App\Exports;

use App\Models\Report;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ReportsListExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        /** @var Builder $q */
        $q = Report::query()
            ->with(['borrower.division', 'period', 'template', 'summary', 'creator'])
            ->orderByDesc('submitted_at');

        if (!empty($this->filters['division_id'])) {
            $q->whereHas('borrower', function ($b) {
                $b->where('division_id', $this->filters['division_id']);
            });
        }

        if (!empty($this->filters['period_id'])) {
            $q->where('period_id', $this->filters['period_id']);
        }

        if (!empty($this->filters['q'])) {
            $term = '%' . $this->filters['q'] . '%';
            $q->where(function ($query) use ($term) {
                $query->whereHas('borrower', function ($b) use ($term) {
                    $b->where('name', 'like', $term);
                })
                ->orWhereHas('borrower.division', function ($d) use ($term) {
                    $d->where('name', 'like', $term)
                      ->orWhere('code', 'like', $term);
                })
                ->orWhereHas('period', function ($p) use ($term) {
                    $p->where('name', 'like', $term);
                })
                ->orWhereHas('creator', function ($u) use ($term) {
                    $u->where('name', 'like', $term);
                });
            });
        }

        return $q;
    }

    public function headings(): array
    {
        return [
            'Division',
            'Borrower',
            'Period',
            'Template',
            'Status',
            'Final Classification',
            'Indicative Collectibility',
            'Submitted At',
        ];
    }

    /** @param Report $report */
    public function map($report): array
    {
        return [
            $report->borrower?->division?->name ?? '',
            $report->borrower?->name ?? '',
            $report->period?->name ?? '',
            $report->template?->name ?? '',
            $report->status?->label() ?? '',
            ($report->summary?->final_classification === 0 ? 'WATCHLIST' : ($report->summary?->final_classification === 1 ? 'SAFE' : '')),
            $report->summary?->indicative_collectibility ?? '',
            optional($report->submitted_at)?->format('Y-m-d H:i') ?? '',
        ];
    }
}