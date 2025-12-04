<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get period comparison parameters
        $period1Id = $request->query('period1');
        $period2Id = $request->query('period2');
        
        // Validate period parameters if provided
        if ($period1Id && $period2Id) {
            $validated = $request->validate([
                'period1' => 'required|integer|exists:periods,id',
                'period2' => 'required|integer|exists:periods,id|different:period1'
            ]);
            
            $period1Id = (int) $validated['period1'];
            $period2Id = (int) $validated['period2'];
        }
        
        $dashboardData = $this->dashboardService->getDashboardData($user);
        
        // Get available periods for dropdown
        $availablePeriods = $this->dashboardService->getAvailablePeriods();
        
        // Get comparison data if both periods are selected
        $comparisonData = null;
        if ($period1Id && $period2Id) {
            $comparisonData = $this->dashboardService->getPeriodComparisonData($period1Id, $period2Id);
        }

        // Debug logging
        \Log::info('Dashboard Data', [
            'user_role' => $user->getRoleNames()->first(),
            'available_periods_count' => count($availablePeriods),
            'has_comparison_data' => !is_null($comparisonData),
            'period1' => $period1Id,
            'period2' => $period2Id,
        ]);

        return Inertia::render('dashboard', [
            'dashboardData' => $dashboardData,
            'availablePeriods' => $availablePeriods,
            'selectedPeriods' => [
                'period1' => $period1Id,
                'period2' => $period2Id
            ],
            'comparisonData' => $comparisonData
        ]);
    }
}