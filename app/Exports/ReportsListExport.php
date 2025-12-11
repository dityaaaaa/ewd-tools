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
                'borrower.reports' => function ($query) {
                    $query->with(['period', 'aspects.aspectVersion.aspect', 'summary'])
                        ->orderBy('submitted_at', 'desc');
                },
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
            'Submitted At',
            // P1 - Current Period
            'P1 Aspect A Status',
            'P1 Aspect B Status',
            'P1 Aspect C Status',
            'P1 Aspect D Status',
            'P1 Aspect E Status',
            'P1 Final Classification',
            'P1 Indicative Collectibility',
            // P2 - Previous Period
            'P2 Aspect A Status',
            'P2 Aspect B Status',
            'P2 Aspect C Status',
            'P2 Aspect D Status',
            'P2 Aspect E Status',
            'P2 Final Classification',
            // P3 - 2 Periods Ago
            'P3 Aspect A Status',
            'P3 Aspect B Status',
            'P3 Aspect C Status',
            'P3 Aspect D Status',
            'P3 Aspect E Status',
            'P3 Final Classification',
            // Approvers
            'RM Approver',
            'Analyst Approver',
            'Dept Head Approver',
            'Division Head Approver',
        ];
    }

    /** @param Report $report */
    public function map($report): array
    {
        // Get P1 (current period) data
        $p1Data = $this->getCurrentPeriodData($report);
        
        // Get P2 (previous period) data
        $p2Data = $this->getPeriodData($report, 1);
        
        // Get P3 (2 periods ago) data
        $p3Data = $this->getPeriodData($report, 2);
        
        // Get approver names
        $approverNames = $this->getApproverNames($report);
        
        return [
            $report->borrower?->division?->name ?? '',
            $report->borrower?->name ?? '',
            $report->period?->name ?? '',
            $report->template?->name ?? '',
            $report->status?->label() ?? '',
            optional($report->submitted_at)?->format('Y-m-d H:i') ?? '',
            // P1 - Current Period
            $p1Data['aspects']['A'] ?? '-',
            $p1Data['aspects']['B'] ?? '-',
            $p1Data['aspects']['C'] ?? '-',
            $p1Data['aspects']['D'] ?? '-',
            $p1Data['aspects']['E'] ?? '-',
            $p1Data['final_classification'] ?? '-',
            $p1Data['indicative_collectibility'] ?? '-',
            // P2 - Previous Period
            $p2Data['aspects']['A'] ?? '-',
            $p2Data['aspects']['B'] ?? '-',
            $p2Data['aspects']['C'] ?? '-',
            $p2Data['aspects']['D'] ?? '-',
            $p2Data['aspects']['E'] ?? '-',
            $p2Data['final_classification'] ?? '-',
            // P3 - 2 Periods Ago
            $p3Data['aspects']['A'] ?? '-',
            $p3Data['aspects']['B'] ?? '-',
            $p3Data['aspects']['C'] ?? '-',
            $p3Data['aspects']['D'] ?? '-',
            $p3Data['aspects']['E'] ?? '-',
            $p3Data['final_classification'] ?? '-',
            // Approvers
            $approverNames[1] ?? '-',
            $approverNames[2] ?? '-',
            $approverNames[3] ?? '-',
            $approverNames[4] ?? '-',
        ];
    }
    
    /**
     * Get current period (P1) data
     * 
     * @param Report $report
     * @return array
     */
    protected function getCurrentPeriodData($report): array
    {
        $result = [
            'aspects' => [],
            'final_classification' => '-',
            'indicative_collectibility' => '-'
        ];
        
        // Get aspect statuses from current report
        foreach ($report->aspects as $aspect) {
            $code = $aspect->aspectVersion?->aspect?->code ?? '';
            if ($code) {
                $classification = $aspect->classification == 0 ? 'Warning' : 'Safe';
                $result['aspects'][$code] = $classification;
            }
        }
        
        // Get final classification and indicative collectibility from current report
        if ($report->summary) {
            $result['final_classification'] = $report->summary->final_classification === 0 
                ? 'WATCHLIST' 
                : ($report->summary->final_classification === 1 ? 'SAFE' : '-');
            $result['indicative_collectibility'] = $report->summary->indicative_collectibility ?? '-';
        }
        
        return $result;
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
    
    /**
     * Get period data for the same borrower at a specific offset
     * 
     * @param Report $report Current report
     * @param int $offset Number of periods back (1 = P2, 2 = P3, etc.)
     * @return array
     */
    protected function getPeriodData($report, int $offset): array
    {
        $result = [
            'aspects' => [],
            'final_classification' => '-'
        ];
        
        // Get all reports for this borrower, ordered by submitted date descending
        $borrowerReports = $report->borrower->reports ?? collect();
        
        // Find the current report index
        $currentIndex = $borrowerReports->search(function ($r) use ($report) {
            return $r->id === $report->id;
        });
        
        // If not found or offset is out of bounds, return empty data
        if ($currentIndex === false || $currentIndex + $offset >= $borrowerReports->count()) {
            return $result;
        }
        
        // Get the report at the specified offset
        $targetReport = $borrowerReports[$currentIndex + $offset];
        
        // Get aspect statuses from target report
        foreach ($targetReport->aspects as $aspect) {
            $code = $aspect->aspectVersion?->aspect?->code ?? '';
            if ($code) {
                $classification = $aspect->classification == 0 ? 'Warning' : 'Safe';
                $result['aspects'][$code] = $classification;
            }
        }
        
        // Get final classification from target report
        if ($targetReport->summary) {
            $result['final_classification'] = $targetReport->summary->final_classification === 0 
                ? 'WATCHLIST' 
                : ($targetReport->summary->final_classification === 1 ? 'SAFE' : '-');
        }
        
        return $result;
    }
}