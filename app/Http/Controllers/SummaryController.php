<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitApprovalRequest;
use App\Models\Report;
use App\Models\ReportSummary;
use App\Models\User;
use App\Services\ApprovalService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class SummaryController extends Controller
{
    protected ApprovalService $approvalService;

    public function __construct(
        ApprovalService $approvalService
    ) {
        $this->approvalService = $approvalService;
    }

    public function show(Report $report)
    {
        $report->loadMissing([
            'borrower.division',
            'borrower.detail',
            'borrower.facilities',
            'summary',
            'aspects.aspectVersion.aspect',
            'creator:id,name',
            'period:id,name',
            'approvals.reviewer:id,name',
        ]);

        return Inertia::render('summary', [
            'reportData' => $report,
        ]);
    }

    public function update(SubmitApprovalRequest $request, Report $report)
    {
        $actor = Auth::user();

        try {
            $this->approvalService->submitApproval(
                $report,
                $actor,
                $request->validated()
            );

            return redirect()->route('summary.show', $report)->with('success', 'Tindakan persetujuan berhasil disimpan.');
        } catch (Exception $e) {
            report($e);

            return back()->with('error', 'Gagal memproses persetujuan: ' . $e->getMessage());
        }
    }
}
