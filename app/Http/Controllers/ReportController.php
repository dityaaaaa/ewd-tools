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

    public function show($id)
    {
        $report = $this->reportService->getReportById((int)$id);

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

    public function edit($id)
    {
        $report = $this->reportService->getReportById((int)$id);

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

    public function update(UpdateFormRequest $request, $id)
    {
        $actor = Auth::user();
        $report = $this->reportService->getReportById((int)$id);

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

    public function exportPdf($id)
    {
        $report = $this->reportService->getReportById((int)$id);



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
        $monitoringData = $monitoringNoteService->getMonitoringNoteData((int)$id);

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

    public function exportExcel(Request $request)
    {
        try {
            $filters = [
                'q' => $request->get('q'),
                'division_id' => $request->get('division_id'),
                'period_id' => $request->get('period_id'),
            ];

            $filename = 'Reports_' . now()->format('Y-m-d') . '.xlsx';

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ReportsListExport($filters),
                $filename
            );
        } catch (Throwable $e) {
            Log::error('Gagal export Excel rekap laporan', [
                'user_id' => Auth::id(),
                'filters' => $filters ?? [],
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Terjadi kesalahan saat membuat file export');
        }
    }

    public function exportExcelDetail($id)
    {
        try {
            $report = $this->reportService->getReportById((int)$id);

            $report->load([
                'borrower.division',
                'borrower.facilities',
                'borrower.detail',
                'period',
                'template',
                'creator',
                'summary',
                'approvals' => function ($q) {
                    $q->orderBy('level');
                },
                'approvals.reviewer',
                'aspects.aspectVersion.aspect',
                'answers.questionVersion.aspectVersion.aspect',
                'answers.questionOption',
            ]);

            /** @var MonitoringNoteService $monitoringNoteService */
            $monitoringNoteService = app(MonitoringNoteService::class);
            $monitoringData = $monitoringNoteService->getMonitoringNoteData((int)$id);

            $summary = [
                'Borrower' => $report->borrower?->name ?? '',
                'Division' => $report->borrower?->division?->name ?? '',
                'Period' => $report->period?->name ?? '',
                'Template' => $report->template?->name ?? '',
                'Status' => $report->status?->label() ?? '',
                'Final Classification' => ($report->summary?->final_classification === 0 ? 'WATCHLIST' : ($report->summary?->final_classification === 1 ? 'SAFE' : '')),
                'Indicative Collectibility' => $report->summary?->indicative_collectibility ?? '',
                'Override' => $report->summary?->is_override ? 'Yes' : 'No',
                'Override Reason' => $report->summary?->override_reason ?? '',
                'Business Notes' => $report->summary?->business_notes ?? '',
                'Reviewer Notes' => $report->summary?->reviewer_notes ?? '',
                'Submitted At' => optional($report->submitted_at)?->format('Y-m-d H:i') ?? '',
                'Created By' => $report->creator?->name ?? '',
            ];

            $watchlistArr = [
                'watchlist_reason' => $monitoringData['monitoring_note']?->watchlist_reason ?? '',
                'account_strategy' => $monitoringData['monitoring_note']?->account_strategy ?? '',
            ];

            $qaRows = [];
            foreach ($report->answers as $ans) {
                $qv = $ans->questionVersion;
                $qaRows[] = [
                    $qv?->aspectVersion?->aspect?->code ?? '',
                    $qv?->aspectVersion?->name ?? '',
                    $qv?->question_text ?? '',
                    $ans->questionOption?->option_text ?? '',
                    $ans->questionOption?->score ?? '',
                    $ans->notes ?? '',
                ];
            }

            $approvals = [];
            foreach ($report->approvals as $approval) {
                $approvals[] = [
                    $approval->level?->label() ?? '-',
                    $approval->reviewer?->name ?? '-',
                    $approval->status?->label() ?? '-',
                    optional($approval->created_at)->format('Y-m-d H:i') ?? '-',
                    $approval->notes ?? '',
                ];
            }

            $filename = 'Report_' . ($report->borrower?->name ?? 'Unknown') . '_' . ($report->period?->name ?? 'Period') . '.xlsx';

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ReportDetailExport($summary, $watchlistArr, $monitoringData['action_items'] ?? [], $qaRows, $approvals),
                $filename
            );
        } catch (Throwable $e) {
            Log::error('Gagal export Excel detail laporan', [
                'report_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Terjadi kesalahan saat membuat file export');
        }
    }

    public function exportPdfDownload($id)
    {
        try {
            $report = $this->reportService->getReportById((int)$id);

            $report->load([
                'borrower.division',
                'period',
                'summary',
                'aspects.aspectVersion.aspect',
                'answers.questionVersion.aspectVersion.aspect',
                'answers.questionOption',
                'approvals' => function ($query) {
                    $query->orderBy('level');
                },
                'approvals.reviewer',
            ]);

            /** @var MonitoringNoteService $monitoringNoteService */
            $monitoringNoteService = app(MonitoringNoteService::class);
            $monitoringData = $monitoringNoteService->getMonitoringNoteData((int)$id);

            $answers = $report->answers->map(function ($ans) {
                $qv = $ans->questionVersion;
                return [
                    'aspect_code' => $qv?->aspectVersion?->aspect?->code ?? '',
                    'aspect_name' => $qv?->aspectVersion?->name ?? '',
                    'question' => $qv?->question_text ?? '',
                    'option' => $ans->questionOption?->option_text ?? '',
                    'score' => $ans->questionOption?->score ?? '',
                    'notes' => $ans->notes ?? '',
                ];
            })->toArray();

            $filename = 'Report_' . ($report->borrower?->name ?? 'Unknown') . '_' . ($report->period?->name ?? 'Period') . '.pdf';

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.report-detail', [
                'report' => $report,
                'watchlist' => $monitoringData['watchlist'] ?? null,
                'monitoring_note' => $monitoringData['monitoring_note'] ?? null,
                'action_items' => $monitoringData['action_items'] ?? [
                    'previous_period' => [],
                    'current_progress' => [],
                    'next_period' => [],
                ],
                'answers' => $answers,
            ])->setPaper('a4');

            return $pdf->download($filename);
        } catch (Throwable $e) {
            Log::error('Gagal export PDF laporan', [
                'report_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Terjadi kesalahan saat membuat file export');
        }
    }
}
