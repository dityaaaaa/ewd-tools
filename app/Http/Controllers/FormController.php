<?php

namespace App\Http\Controllers;

use App\Enums\FacilityType;
use App\Http\Requests\StoreFormRequest;
use App\Models\Borrower;
use App\Services\ApprovalService;
use App\Services\FormService;
use App\Services\PeriodService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class FormController extends Controller
{
    protected FormService $formService;
    protected PeriodService $periodService;
    protected ApprovalService $approvalService;

    public function __construct(
        FormService $formService,
        PeriodService $periodService,
        ApprovalService $approvalService
    ) {
        $this->formService = $formService;
        $this->periodService = $periodService;
        $this->approvalService = $approvalService;
    }

    public function index(Request $request)
    {
        if ($request->has('borrower_id')) {
            Session::forget(['borrower_data', 'facility_data']);
        }

        $borrowers = Borrower::select(['id', 'name'])->get();
        $period = $this->periodService->getActivePeriod();

        $borrowerData = session('borrower_data', $request->input('borrower_data', []));
        $facilityData = session('facility_data', $request->input('facility_data', []));

        $templateData = $this->formService->getFormTemplateData($borrowerData, $facilityData);

        return Inertia::render('form/index', [
            'borrowers' => $borrowers,
            'period' => $period,
            'template_id' => $templateData['template_id'],
            'aspect_groups' => $templateData['aspect_groups'],
            'borrower_data' => $borrowerData,
            'facility_data' => $facilityData,
            'purpose_options' => FacilityType::toSelectOptions(),
        ]);
    }

    public function store(StoreFormRequest $request)
    {
        $actor = Auth::user();

        try {
            $report = $this->formService->submit($request->validated(), $actor);

            if ($report) {
                $this->approvalService->createPendingApprovals($report);
            }
            
            session()->forget(['borrower_data', 'facility_data']);

            return redirect()->route('summary.show', ['report' => $report->id])
                ->with('success', 'Formulir berhasil disubmit.');
        } catch (ValidationException $e) {
            // Teruskan error validasi ke UI agar ditampilkan di form
            throw $e;
        } catch (Exception $e) {
            report($e);
            return back()->with('error', 'Terjadi kesalahan saat menyimpan data.');
        }
    }

    /**
     * Melakukan
     */
    public function saveStepData(Request $request)
    {
        $borrowerData = $request->input('informationBorrower', []);
        $facilityData = $request->input('facilitiesBorrower', []);

        Session::put('borrower_data', $borrowerData);
        Session::put('facility_data', $facilityData);

        $templateData = $this->formService->getFormTemplateData($borrowerData, $facilityData);

        return response()->json([
            'success' => true,
            'template_id' => $templateData['template_id'],
            'aspect_groups' => $templateData['aspect_groups'],
        ]);
    }
}
