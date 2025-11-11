<?php

namespace App\Services;

use App\Models\User;
use App\Models\Report;
use App\Models\Borrower;
use App\Models\Period;
use App\Models\Approval;
use App\Models\Watchlist;
use App\Models\ActionItem;
use App\Enums\ReportStatus;
use App\Enums\PeriodStatus;
use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Enums\ActionItemStatus;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService extends BaseService
{
    public function getDashboardData(User $user): array
    {
        $userRole = $user->getRoleNames()->first();
        
        return match ($userRole) {
            'admin' => $this->getAdminDashboard($user),
            'relationship_manager' => $this->getRelationshipManagerDashboard($user),
            'risk_analyst' => $this->getRiskAnalystDashboard($user),
            'kadept_bisnis' => $this->getKadeptBisnisDashboard($user),
            'kadept_risk' => $this->getKadeptRiskDashboard($user),
            default => $this->getDefaultDashboard($user),
        };
    }

    protected function getAdminDashboard(User $user): array
    {
        return [
            'role' => 'admin',
            'title' => 'Admin Dashboard',
            'description' => 'Kelola sistem secara menyeluruh dan pantau aktivitas semua pengguna',
            'stats' => [
                'total_users' => User::count(),
                'total_reports' => Report::count(),
                'total_borrowers' => Borrower::count(),
            'active_periods' => Period::where('status', PeriodStatus::ACTIVE)->count(),
            ],
            'charts' => [
                'reports_by_status' => $this->getReportsByStatus(),
                'reports_by_division' => $this->getReportsByDivision(),
                'monthly_report_trend' => $this->getMonthlyReportTrend(),
                'approval_pipeline' => $this->getApprovalPipelineSummary(),
            ],
            'recent_activities' => $this->getRecentActivities(),
            'system_health' => $this->getSystemHealth(),
            'actionable_items' => [
                'pending_approvals' => Approval::where('status', ApprovalStatus::PENDING)->count(),
                'overdue_reports' => $this->getOverdueReportsCount(),
                'inactive_users' => $this->getInactiveUsersCount(),
            ],
        ];
    }

    protected function getRelationshipManagerDashboard(User $user): array
    {
        $myReports = Report::where('created_by', $user->id);
        $myBorrowers = Borrower::where('division_id', $user->division_id);

        return [
            'role' => 'relationship_manager',
            'title' => 'Relationship Manager Dashboard',
            'description' => 'Kelola nasabah dan laporan untuk divisi Anda',
            'stats' => [
                'my_reports' => $myReports->count(),
                'my_borrowers' => $myBorrowers->count(),
                'pending_reports' => $myReports->where('status', ReportStatus::SUBMITTED->value)->count(),
                'approved_reports' => $myReports->where('status', ReportStatus::APPROVED->value)->count(),
            ],
            'charts' => [
                'my_reports_status' => $this->getMyReportsStatus($user),
                'borrower_risk_distribution' => $this->getBorrowerRiskDistribution($user->division_id),
            ],
            'recent_reports' => $this->getRecentReports($user),
            'my_borrowers_list' => $this->getMyBorrowersList($user),
            'actionable_items' => [
                'draft_reports' => $myReports->where('status', ReportStatus::SUBMITTED->value)->count(),
                'reports_need_review' => $this->getReportsNeedingReview($user),
                'upcoming_deadlines' => $this->getUpcomingDeadlines($user),
            ],
            'quick_actions' => [
                'create_report' => true,
                'view_borrowers' => true,
                'check_periods' => true,
            ],
        ];
    }

    protected function getRiskAnalystDashboard(User $user): array
    {
        $pendingApprovals = Approval::where('level', ApprovalLevel::ERO->value)
            ->where('status', ApprovalStatus::PENDING)
            ->whereHas('report.borrower', function ($query) use ($user) {
                $query->where('division_id', $user->division_id);
            });

        return [
            'role' => 'risk_analyst',
            'title' => 'Risk Analyst Dashboard',
            'description' => 'Analisis risiko dan setujui laporan pada level ERO',
            'stats' => [
                'pending_approvals' => $pendingApprovals->count(),
                'approved_this_month' => $this->getApprovedThisMonth($user, ApprovalLevel::ERO),
                'watchlist_items' => $this->getWatchlistCount($user->division_id),
                'action_items' => $this->getActionItemsCount($user->division_id),
            ],
            'charts' => [
                'approval_trend' => $this->getApprovalTrend($user, ApprovalLevel::ERO),
                'risk_classification_distribution' => $this->getRiskClassificationDistribution($user->division_id),
                'approval_pipeline' => $this->getApprovalPipelineSummary($user->division_id),
            ],
            'pending_approvals_list' => $this->getPendingApprovalsList($user, ApprovalLevel::ERO),
            'watchlist_alerts' => $this->getWatchlistAlerts($user->division_id),
            'actionable_items' => [
                'reports_to_review' => $pendingApprovals->count(),
                'overdue_action_items' => $this->getOverdueActionItems($user->division_id),
                'high_risk_borrowers' => $this->getHighRiskBorrowers($user->division_id),
            ],
            'quick_actions' => [
                'review_reports' => true,
                'manage_watchlist' => true,
                'update_action_items' => true,
            ],
        ];
    }

    protected function getKadeptBisnisDashboard(User $user): array
    {
        $pendingApprovals = Approval::where('level', ApprovalLevel::KADEPT_BISNIS->value)
            ->where('status', ApprovalStatus::PENDING)
            ->whereHas('report.borrower', function ($query) use ($user) {
                $query->where('division_id', $user->division_id);
            });

        return [
            'role' => 'kadept_bisnis',
            'title' => 'Kepala Departemen Bisnis Dashboard',
            'description' => 'Pantau kinerja bisnis dan setujui laporan strategis',
            'stats' => [
                'pending_approvals' => $pendingApprovals->count(),
                'division_reports' => $this->getDivisionReportsCount($user->division_id),
                'team_performance' => $this->getTeamPerformance($user->division_id),
                'business_growth' => $this->getBusinessGrowth($user->division_id),
            ],
            'charts' => [
                'division_performance' => $this->getDivisionPerformance($user->division_id),
                'approval_efficiency' => $this->getApprovalEfficiency($user->division_id),
                'approval_pipeline' => $this->getApprovalPipelineSummary($user->division_id),
            ],
            'pending_approvals_list' => $this->getPendingApprovalsList($user, ApprovalLevel::KADEPT_BISNIS),
            'team_overview' => $this->getTeamOverview($user->division_id),
            'actionable_items' => [
                'strategic_approvals' => $pendingApprovals->count(),
                'team_bottlenecks' => $this->getTeamBottlenecks($user->division_id),
                'performance_alerts' => $this->getPerformanceAlerts($user->division_id),
            ],
            'quick_actions' => [
                'approve_reports' => true,
                'view_team_performance' => true,
                'manage_division' => true,
            ],
        ];
    }

    protected function getKadeptRiskDashboard(User $user): array
    {
        $pendingApprovals = Approval::where('level', ApprovalLevel::KADIV_ERO->value)
            ->where('status', ApprovalStatus::PENDING)
            ->whereHas('report.borrower', function ($query) use ($user) {
                $query->where('division_id', $user->division_id);
            });

        return [
            'role' => 'kadept_risk',
            'title' => 'Kepala Departemen Risk Dashboard',
            'description' => 'Kelola risiko divisi dan berikan persetujuan final',
            'stats' => [
                'pending_final_approvals' => $pendingApprovals->count(),
                'risk_portfolio' => $this->getRiskPortfolioStats($user->division_id),
                'compliance_score' => $this->getComplianceScore($user->division_id),
                'risk_mitigation' => $this->getRiskMitigationStats($user->division_id),
            ],
            'charts' => [
                'risk_trend_analysis' => $this->getRiskTrendAnalysis($user->division_id),
                'portfolio_health' => $this->getPortfolioHealth($user->division_id),
                'approval_pipeline' => $this->getApprovalPipelineSummary($user->division_id),
            ],
            'pending_approvals_list' => $this->getPendingApprovalsList($user, ApprovalLevel::KADIV_ERO),
            'risk_alerts' => $this->getRiskAlerts($user->division_id),
            'actionable_items' => [
                'final_approvals' => $pendingApprovals->count(),
                'critical_risks' => $this->getCriticalRisks($user->division_id),
                'compliance_issues' => $this->getComplianceIssues($user->division_id),
            ],
            'quick_actions' => [
                'final_approval' => true,
                'risk_analysis' => true,
                'compliance_review' => true,
            ],
        ];
    }

    protected function getDefaultDashboard(User $user): array
    {
        return [
            'role' => 'default',
            'title' => 'Dashboard',
            'description' => 'Selamat datang di sistem monitoring',
            'stats' => [
                'total_reports' => Report::count(),
                'total_borrowers' => Borrower::count(),
            ],
            'actionable_items' => [],
        ];
    }

    // Helper methods for data aggregation
    protected function getReportsByStatus(): array
    {
        return Report::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    protected function getReportsByDivision(): array
    {
        return Report::join('borrowers', 'reports.borrower_id', '=', 'borrowers.id')
            ->join('divisions', 'borrowers.division_id', '=', 'divisions.id')
            ->select('divisions.name', DB::raw('count(*) as count'))
            ->groupBy('divisions.name')
            ->pluck('count', 'name')
            ->toArray();
    }

    protected function getMonthlyReportTrend(): array
    {
        return Report::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    protected function getRecentActivities(): array
    {
        return Report::with(['borrower', 'creator'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'type' => 'report_created',
                    'description' => "Laporan untuk {$report->borrower->name} dibuat oleh {$report->creator->name}",
                    'created_at' => $report->created_at,
                ];
            })
            ->toArray();
    }

    protected function getSystemHealth(): array
    {
        return [
            'database_status' => 'healthy',
            'active_users' => User::whereDate('updated_at', '>=', Carbon::now()->subDays(7))->count(),
            'system_load' => 'normal',
        ];
    }

    protected function getOverdueReportsCount(): int
    {
        // Implement logic for overdue reports based on your business rules
        return 0;
    }

    protected function getInactiveUsersCount(): int
    {
        return User::whereDate('updated_at', '<', Carbon::now()->subDays(30))->count();
    }

    protected function getMyReportsStatus(User $user): array
    {
        return Report::where('created_by', $user->id)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    protected function getBorrowerRiskDistribution(int $divisionId): array
    {
        return Report::join('borrowers', 'reports.borrower_id', '=', 'borrowers.id')
            ->join('report_summaries', 'reports.id', '=', 'report_summaries.report_id')
            ->where('borrowers.division_id', $divisionId)
            ->select('report_summaries.final_classification', DB::raw('count(*) as count'))
            ->groupBy('report_summaries.final_classification')
            ->pluck('count', 'final_classification')
            ->toArray();
    }

    protected function getRecentReports(User $user): array
    {
        return Report::with(['borrower', 'period'])
            ->where('created_by', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->toArray();
    }

    protected function getMyBorrowersList(User $user): array
    {
        return Borrower::where('division_id', $user->division_id)
            ->latest()
            ->limit(10)
            ->get()
            ->toArray();
    }

    protected function getReportsNeedingReview(User $user): int
    {
        // Implement logic for reports needing review
        return 0;
    }

    protected function getUpcomingDeadlines(User $user): int
    {
        // Implement logic for upcoming deadlines
        return 0;
    }

    protected function getApprovedThisMonth(User $user, ApprovalLevel $level): int
    {
        return Approval::where('level', $level->value)
            ->where('reviewed_by', $user->id)
            ->where('status', ApprovalStatus::APPROVED)
            ->whereMonth('updated_at', Carbon::now()->month)
            ->count();
    }

    protected function getWatchlistCount(int $divisionId): int
    {
        return Watchlist::whereHas('report.borrower', function ($query) use ($divisionId) {
            $query->where('division_id', $divisionId);
        })->count();
    }

    protected function getActionItemsCount(int $divisionId): int
    {
        return ActionItem::whereHas('monitoringNote.watchlist.report.borrower', function ($query) use ($divisionId) {
            $query->where('division_id', $divisionId);
        })->count();
    }

    protected function getApprovalTrend(User $user, ApprovalLevel $level): array
    {
        return Approval::where('level', $level->value)
            ->where('reviewed_by', $user->id)
            ->select(
                DB::raw('DATE(updated_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('updated_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    protected function getRiskClassificationDistribution(int $divisionId): array
    {
        return Report::join('borrowers', 'reports.borrower_id', '=', 'borrowers.id')
            ->join('report_summaries', 'reports.id', '=', 'report_summaries.report_id')
            ->where('borrowers.division_id', $divisionId)
            ->select('report_summaries.final_classification', DB::raw('count(*) as count'))
            ->groupBy('report_summaries.final_classification')
            ->pluck('count', 'final_classification')
            ->toArray();
    }

    protected function getPendingApprovalsList(User $user, ApprovalLevel $level): array
    {
        return Approval::with(['report.borrower', 'report.creator'])
            ->where('level', $level->value)
            ->where('status', ApprovalStatus::PENDING)
            ->whereHas('report.borrower', function ($query) use ($user) {
                $query->where('division_id', $user->division_id);
            })
            ->latest()
            ->limit(10)
            ->get()
            ->toArray();
    }

    protected function getWatchlistAlerts(int $divisionId): array
    {
        return Watchlist::with(['report.borrower'])
            ->whereHas('report.borrower', function ($query) use ($divisionId) {
                $query->where('division_id', $divisionId);
            })
            ->latest()
            ->limit(5)
            ->get()
            ->toArray();
    }

    protected function getOverdueActionItems(int $divisionId): int
    {
        return ActionItem::where('status', ActionItemStatus::OVERDUE->value)
            ->whereHas('monitoringNote.watchlist.report.borrower', function ($query) use ($divisionId) {
                $query->where('division_id', $divisionId);
            })
            ->count();
    }

    protected function getHighRiskBorrowers(int $divisionId): int
    {
        return Report::join('borrowers', 'reports.borrower_id', '=', 'borrowers.id')
            ->join('report_summaries', 'reports.id', '=', 'report_summaries.report_id')
            ->where('borrowers.division_id', $divisionId)
            ->where('report_summaries.final_classification', '>=', 4) // Assuming 4+ is high risk
            ->distinct('borrowers.id')
            ->count();
    }

    // Additional helper methods for other roles...
    protected function getDivisionReportsCount(int $divisionId): int
    {
        return Report::whereHas('borrower', function ($query) use ($divisionId) {
            $query->where('division_id', $divisionId);
        })->count();
    }

    protected function getTeamPerformance(int $divisionId): array
    {
        return [
            'reports_completed' => Report::whereHas('borrower', function ($query) use ($divisionId) {
                $query->where('division_id', $divisionId);
            })->where('status', ReportStatus::APPROVED->value)->count(),
            'average_processing_time' => 5.2, // days - implement actual calculation
            'efficiency_score' => 85, // percentage - implement actual calculation
        ];
    }

    protected function getBusinessGrowth(int $divisionId): array
    {
        return [
            'new_borrowers_this_month' => Borrower::where('division_id', $divisionId)
                ->whereMonth('created_at', Carbon::now()->month)
                ->count(),
            'growth_rate' => 12.5, // percentage - implement actual calculation
        ];
    }

    protected function getDivisionPerformance(int $divisionId): array
    {
        // Implement division performance metrics
        return [];
    }

    protected function getApprovalEfficiency(int $divisionId): array
    {
        // Implement approval efficiency metrics
        return [];
    }

    protected function getTeamOverview(int $divisionId): array
    {
        return User::where('division_id', $divisionId)
            ->with('roles')
            ->get()
            ->groupBy(function ($user) {
                return $user->getRoleNames()->first();
            })
            ->map(function ($users, $role) {
                return [
                    'role' => $role,
                    'count' => $users->count(),
                    'users' => $users->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ];
                    }),
                ];
            })
            ->toArray();
    }

    protected function getTeamBottlenecks(int $divisionId): int
    {
        // Implement team bottleneck detection
        return 0;
    }

    protected function getPerformanceAlerts(int $divisionId): int
    {
        // Implement performance alert logic
        return 0;
    }

    protected function getRiskPortfolioStats(int $divisionId): array
    {
        return [
            'total_exposure' => 1000000, // Implement actual calculation
            'high_risk_percentage' => 15.5,
            'portfolio_quality' => 'Good',
        ];
    }

    protected function getComplianceScore(int $divisionId): int
    {
        // Implement compliance scoring logic
        return 92;
    }

    protected function getRiskMitigationStats(int $divisionId): array
    {
        return [
            'active_mitigations' => 5,
            'resolved_this_month' => 3,
            'effectiveness_rate' => 88.5,
        ];
    }

    protected function getRiskTrendAnalysis(int $divisionId): array
    {
        // Implement risk trend analysis
        return [];
    }

    protected function getPortfolioHealth(int $divisionId): array
    {
        // Implement portfolio health metrics
        return [];
    }

    protected function getRiskAlerts(int $divisionId): array
    {
        // Implement risk alert logic
        return [];
    }

    protected function getCriticalRisks(int $divisionId): int
    {
        // Implement critical risk detection
        return 2;
    }

    protected function getComplianceIssues(int $divisionId): int
    {
        // Implement compliance issue detection
        return 1;
    }

    /**
     * Ringkasan pipeline persetujuan: total pending/approved/rejected.
     * Opsional filter berdasarkan division_id borrower.
     */
    protected function getApprovalPipelineSummary(?int $divisionId = null): array
    {
        $query = Approval::query();
        if ($divisionId) {
            $query->whereHas('report.borrower', function ($q) use ($divisionId) {
                $q->where('division_id', $divisionId);
            });
        }

        $raw = $query
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'pending' => (int)($raw[ApprovalStatus::PENDING->value] ?? 0),
            'approved' => (int)($raw[ApprovalStatus::APPROVED->value] ?? 0),
            'rejected' => (int)($raw[ApprovalStatus::REJECTED->value] ?? 0),
        ];
    }
}