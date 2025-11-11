<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Services\FormService;
use App\Services\MonitoringNoteService;
use App\Services\DivisionService;
use App\Services\PeriodService;
use App\Enums\ReportStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\UpdateFormRequest;
use App\Models\Borrower;
use App\Enums\FacilityType;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class ReportController extends Controller
{
    protected ReportService $reportService;
    protected DivisionService $divisionService;
    protected PeriodService $periodService;
    protected FormService $formService;

    public function __construct(
        ReportService $reportService,
        DivisionService $divisionService,
        PeriodService $periodService,
        FormService $formService,
    ) {
        $this->reportService = $reportService;
        $this->divisionService = $divisionService;
        $this->periodService = $periodService;
        $this->formService = $formService;
    }

    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $filters = [
                'q' => $request->get('q'),
                'division_id' => $request->get('division_id'),
                'period_id' => $request->get('period_id'),
            ];
            $reports = $this->reportService->getAllReports($perPage, $filters);
            $divisions = $this->divisionService->getDivisionsForFilters();
            $periods = $this->periodService->getAllPeriods();
            return Inertia::render('report/index', [
                'reports' => $reports,
                'divisions' => $divisions,
                'periods' => $periods,
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal memuat laporan: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat mengambil laporan');
        }
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

    public function edit(int $id)
    {
        $report = $this->reportService->getReportById($id);

        // Authorization: reuse submit logic for RM resubmission
        $this->authorize('submit', $report);

        // Prefill borrower and facility data
        $detail = $report->borrower->detail;
        $borrowerData = [
            'borrowerId' => $report->borrower_id,
            'borrowerGroup' => $detail?->borrower_group ?? '',
            'purpose' => $detail?->purpose,
            'economicSector' => $detail?->economic_sector,
            'businessField' => $detail?->business_field,
            'borrowerBusiness' => $detail?->borrower_business,
            'collectibility' => (int)($detail?->collectibility ?? 1),
            'restructuring' => (bool)($detail?->restructuring ?? false),
        ];

        $facilityData = $report->borrower->facilities->map(function ($f) {
            return [
                'id' => $f->id,
                'name' => $f->facility_name,
                'limit' => (float)$f->limit,
                'outstanding' => (float)$f->outstanding,
                'interestRate' => (float)$f->interest_rate,
                'principalArrears' => (float)$f->principal_arrears,
                'interestArrears' => (float)$f->interest_arrears,
                'pdo' => (int)$f->pdo_days,
                'maturityDate' => $f->maturity_date,
            ];
        })->toArray();

        // Existing answers
        $answers = $report->answers->map(function ($ans) {
            return [
                'questionId' => $ans->question_version_id,
                'selectedOptionId' => $ans->question_option_id,
                'notes' => $ans->notes,
            ];
        })->toArray();

        // Compute applicable template and aspect groups using current data
        $templateData = $this->formService->getFormTemplateData($borrowerData, $facilityData);

        $borrowers = Borrower::select(['id', 'name'])->get();

        return Inertia::render('form/index', [
            'borrowers' => $borrowers,
            'period' => $report->period,
            'template_id' => $templateData['template_id'] ?? $report->template_id,
            'aspect_groups' => $templateData['aspect_groups'] ?? [],
            'borrower_data' => $borrowerData,
            'facility_data' => $facilityData,
            'purpose_options' => FacilityType::toSelectOptions(),
            'submit_url' => route('reports.update', $report->id),
            'answers' => $answers,
        ]);
    }

    public function update(UpdateFormRequest $request, int $id)
    {
        $actor = Auth::user();
        $report = $this->reportService->getReportById($id);

        $this->authorize('submit', $report);

        try {
            $this->formService->resubmit($report, $request->validated(), $actor);

            session()->forget(['borrower_data', 'facility_data']);

            return redirect()->route('summary.show', ['report' => $report->id])
                ->with('success', 'Laporan berhasil diperbarui dan dikirim ulang.');
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Terjadi kesalahan saat memperbarui laporan: ' . $e->getMessage());
        }
    }

    public function exportPdf(int $id)
    {
        $report = $this->reportService->getReportById($id);

        // Hanya izinkan export jika status laporan sudah selesai
        if ($report->status !== ReportStatus::DONE) {
            abort(403, 'Laporan belum selesai. Export PDF hanya untuk laporan yang sudah selesai.');
        }

        $report->load([
            'borrower.division',
            'period',
            'summary',
            'approvals' => function ($query) {
                $query->orderBy('level');
            },
            'approvals.reviewer',
            'audits',
        ]);

        // Gabungkan data NAW (watchlist note) ke dalam satu halaman
        /** @var MonitoringNoteService $monitoringNoteService */
        $monitoringNoteService = app(MonitoringNoteService::class);
        $monitoringData = $monitoringNoteService->getMonitoringNoteData($id);

        return Inertia::render('report/export', [
            'report' => $report,
            'watchlist' => $monitoringData['watchlist'] ?? null,
            'monitoring_note' => $monitoringData['monitoring_note'] ?? null,
            'action_items' => $monitoringData['action_items'] ?? [
                'previous_period' => [],
                'current_progress' => [],
                'next_period' => [],
            ],
        ]);
    }
}
