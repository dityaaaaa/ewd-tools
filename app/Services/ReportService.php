<?php

namespace App\Services;

use App\Models\Report;
use App\Models\User;
use App\Enums\ReportStatus;
use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;

class ReportService
{
    public function getAllReports($perPage = 15, array $filters = [])
    {
        $query = Report::with(['borrower', 'borrower.division', 'period', 'creator'])->latest();

        // General search (q): borrower name, division code/name, period name, creator name
        $q = trim((string)($filters['q'] ?? ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub
                    ->whereHas('borrower', function ($bq) use ($q) {
                        $bq->where('name', 'like', "%{$q}%")
                           ->orWhereHas('division', function ($dq) use ($q) {
                               $dq->where('name', 'like', "%{$q}%")
                                  ->orWhere('code', 'like', "%{$q}%");
                           });
                    })
                    ->orWhereHas('period', function ($pq) use ($q) {
                        $pq->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('creator', function ($cq) use ($q) {
                        $cq->where('name', 'like', "%{$q}%");
                    });
            });
        }

        // Filter by division (borrower.division_id)
        if (!empty($filters['division_id'])) {
            $query->whereHas('borrower', function ($bq) use ($filters) {
                $bq->where('division_id', $filters['division_id']);
            });
        }

        // Filter by period
        if (!empty($filters['period_id'])) {
            $query->where('period_id', $filters['period_id']);
        }

        return $query->paginate($perPage);
    }

    public function getReportById(int $id)
    {
        $report = Report::with([
                'borrower', 
                'borrower.division', 
                'borrower.detail', 
                'borrower.facilities',
                'template', 
                'period', 
                'summary', 
                'creator',
                'answers',
                'answers.questionVersion',
                'answers.questionOption',
                'aspects',
                'aspects.aspectVersion',
                'approvals',
                'approvals.reviewer',
                'audits',
                'audits.user',
            ])->findOrFail($id);
        return $report;
    }

    public function getReportsForApproval(User $user)
    {
        // Check if user is admin - admin can see all reports
        if ($user->hasRole('admin')) {
            return $this->getAllReportsForApproval();
        }

        // Check if user is relationship manager - RM can see their own reports
        if ($user->hasRole('relationship_manager')) {
            return $this->getReportsCreatedByUser($user);
        }

        // For other roles, use the existing approval workflow logic
        $approvalLevel = null;
        if ($user->hasRole('risk_analyst')) {
            $approvalLevel = ApprovalLevel::ERO;
        } elseif ($user->hasRole('kadept_bisnis')) {
            $approvalLevel = ApprovalLevel::KADEPT_BISNIS;
        } elseif ($user->hasRole('kadept_risk')) {
            $approvalLevel = ApprovalLevel::KADIV_ERO;
        }

        if (!$approvalLevel) {
            return collect();
        }

        $query = Report::with([
            'borrower', 
            'borrower.division', 
            'period', 
            'creator',
            'summary',
            'approvals' => function($q) {
                $q->orderBy('level');
            },
            'approvals.reviewer'
        ]);

        // Filter by user's division if user has a division
        if ($user->division_id) {
            $query->whereHas('borrower', function($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        // Filter based on approval level and workflow
        if ($approvalLevel === ApprovalLevel::ERO) {
            // ERO reviews reports that are SUBMITTED
            $query->where('status', ReportStatus::SUBMITTED);
        } elseif ($approvalLevel === ApprovalLevel::KADEPT_BISNIS) {
            // Kadept Bisnis approves after ERO review; report should be REVIEWED
            $query->where('status', ReportStatus::REVIEWED)
                  ->whereHas('approvals', function($q) {
                      $q->where('level', ApprovalLevel::ERO)
                        ->where('status', ApprovalStatus::APPROVED);
                  });
        } elseif ($approvalLevel === ApprovalLevel::KADIV_ERO) {
            // Kadiv Risk final approval after Kadept Bisnis; report should be APPROVED
            $query->where('status', ReportStatus::APPROVED)
                  ->whereHas('approvals', function($q) {
                      $q->where('level', ApprovalLevel::KADEPT_BISNIS)
                        ->where('status', ApprovalStatus::APPROVED);
                  });
        }

        // Only show reports that have pending approval at this level
        $query->whereHas('approvals', function($q) use ($approvalLevel) {
            $q->where('level', $approvalLevel)
              ->where('status', ApprovalStatus::PENDING);
        });

        return $query->latest()->get();
    }

    /**
     * Get all reports for admin users
     */
    public function getAllReportsForApproval()
    {
        return Report::with([
            'borrower', 
            'borrower.division', 
            'period', 
            'creator',
            'summary',
            'approvals' => function($q) {
                $q->orderBy('level');
            },
            'approvals.reviewer'
        ])->latest()->get();
    }

    /**
     * Get reports created by specific user (for RM monitoring)
     */
    public function getReportsCreatedByUser(User $user)
    {
        return Report::with([
            'borrower', 
            'borrower.division', 
            'period', 
            'creator',
            'summary',
            'approvals' => function($q) {
                $q->orderBy('level');
            },
            'approvals.reviewer'
        ])
        ->where('created_by', $user->id)
        ->latest()
        ->get();
    }
}