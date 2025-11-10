<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\ReportService;
use App\Services\DivisionService;
use App\Services\PeriodService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    protected ReportService $reportService;
    protected DivisionService $divisionService;
    protected PeriodService $periodService;

    public function __construct(
        ReportService $reportService,
        DivisionService $divisionService,
        PeriodService $periodService,
    ) {
        $this->reportService = $reportService;
        $this->divisionService = $divisionService;
        $this->periodService = $periodService;
    }

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $filters = [
            'q' => $request->get('q'),
            'division_id' => $request->get('division_id'),
            'period_id' => $request->get('period_id'),
        ];
        $reports = $this->reportService->getAllReports($perPage, $filters);
        // Gunakan daftar divisi yang aman untuk filter agar tidak mewajibkan izin 'view division'
        $divisions = $this->divisionService->getDivisionsForFilters();
        $periods = $this->periodService->getAllPeriods();
        return Inertia::render('report/index', [
            'reports' => $reports,
            'divisions' => $divisions,
            'periods' => $periods,
            'filters' => $filters,
        ]);
    }

    public function show(int $id)
    {
        $report = $this->reportService->getReportById($id);
        
        $report->load([
            'approvals' => function ($query) {
                $query->orderBy('level');
            },
            'approvals.reviewer'
        ]);
        
        return Inertia::render('report/show', [
            'report' => $report
        ]);
    }
}
