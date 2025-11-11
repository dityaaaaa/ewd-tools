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
        $query = Report::with([
            'borrower',
            'borrower.division',
            'period',
            'creator',
            'summary',
            'watchlist',
            'approvals' => function ($q) {
                $q->orderBy('level');
            },
        ])->latest();

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

        // Untuk role selain admin & RM, ambil seluruh laporan di divisi user
        // (risk_analyst, kadept_bisnis, kadept_risk) untuk monitoring proses pelaporan hingga final.
        $isDivisionWideRole = $user->hasRole('risk_analyst') || $user->hasRole('kadept_bisnis') || $user->hasRole('kadept_risk');
        if (!$isDivisionWideRole) {
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

        // Untuk monitoring, jangan batasi berdasarkan status approval workflow.
        // Tampilkan seluruh laporan pada divisi user (jika ada), beserta approvals terurut.

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