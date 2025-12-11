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
            ->with([
                'borrower.division',
                'period',
                'template',
                'summary',
                'creator',
                'aspects.aspectVersion.aspect',
                'approvals' => function ($query) {
                    $query->orderBy('level');
                },
                'approvals.reviewer'
            ])
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
            'Aspect A Status',
            'Aspect B Status',
            'Aspect C Status',
            'Aspect D Status',
            'Aspect E Status',
            'RM Approver',
            'Analyst Approver',
            'Dept Head Approver',
            'Division Head Approver',
        ];
    }

    /** @param Report $report */
    public function map($report): array
    {
        // Get aspect statuses
        $aspectStatuses = $this->getAspectStatuses($report);
        
        // Get approver names
        $approverNames = $this->getApproverNames($report);
        
        return [
            $report->borrower?->division?->name ?? '',
            $report->borrower?->name ?? '',
            $report->period?->name ?? '',
            $report->template?->name ?? '',
            $report->status?->label() ?? '',
            ($report->summary?->final_classification === 0 ? 'WATCHLIST' : ($report->summary?->final_classification === 1 ? 'SAFE' : '')),
            $report->summary?->indicative_collectibility ?? '',
            optional($report->submitted_at)?->format('Y-m-d H:i') ?? '',
            $aspectStatuses['A'] ?? '-',
            $aspectStatuses['B'] ?? '-',
            $aspectStatuses['C'] ?? '-',
            $aspectStatuses['D'] ?? '-',
            $aspectStatuses['E'] ?? '-',
            $approverNames[1] ?? '-',
            $approverNames[2] ?? '-',
            $approverNames[3] ?? '-',
            $approverNames[4] ?? '-',
        ];
    }
    
    /**
     * Get aspect statuses for a report
     * 
     * @param Report $report
     * @return array
     */
    protected function getAspectStatuses($report): array
    {
        $statuses = [];
        
        foreach ($report->aspects as $aspect) {
            $code = $aspect->aspectVersion?->aspect?->code ?? '';
            if ($code) {
                $classification = $aspect->classification == 0 ? 'Warning' : 'Safe';
                $statuses[$code] = $classification;
            }
        }
        
        return $statuses;
    }
    
    /**
     * Get approver names by level
     * 
     * @param Report $report
     * @return array
     */
    protected function getApproverNames($report): array
    {
        $approvers = [];
        
        foreach ([1, 2, 3, 4] as $level) {
            $approval = $report->approvals->firstWhere('level', $level);
            $approvers[$level] = $approval?->reviewer?->name ?? '-';
        }
        
        return $approvers;
    }
}