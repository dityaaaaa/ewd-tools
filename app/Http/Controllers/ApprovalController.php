<?php

namespace App\Http\Controllers;

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus;
use App\Http\Requests\SubmitApprovalRequest;
use App\Models\Approval;
use App\Services\ApprovalService;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Throwable;

class ApprovalController extends Controller
{
    protected ApprovalService $approvalService;
    protected ReportService $reportService;

    public function __construct(ApprovalService $approvalService, ReportService $reportService)
    {
        $this->approvalService = $approvalService;
        $this->reportService = $reportService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = (int)($request->get('per_page', 15));
        $filters = [
            'q' => $request->get('q'),
        ];

        $reports = $this->reportService->getReportsForApproval($user, $perPage, $filters);

        return Inertia::render('approval/index', [
            'reports' => $reports,
            'user' => $user->load('division'),
        ]);
    }
    
    public function approve(SubmitApprovalRequest $request, Approval $approval): RedirectResponse
    {
        try {
            if ($approval->level->value === ApprovalLevel::ERO->value) {
                $this->authorize('review', $approval);
            } else {
                $this->authorize('approve', $approval);
            }
            // Guard tambahan: batasi approval jika belum mencapai level tahapan yang benar
            $this->approvalService->assertCanProcess(
                $request->user(),
                $approval->report,
                $approval->level
            );
            $this->approvalService->processApproval(
                $approval,
                $request->user(),
                ApprovalStatus::APPROVED,
                $request->validated()
            );
        } catch (Throwable $e) {
            return Redirect::back()->withErrors(['message' => $e->getMessage()]);
        }

        return Redirect::back()->with('success', 'Laporan berhasil disetujui.');
    }

    public function reject(SubmitApprovalRequest $request, Approval $approval): RedirectResponse
    {
        try {
            $this->authorize('reject', $approval);
            // Guard tambahan: batasi rejection jika belum mencapai level tahapan yang benar
            $this->approvalService->assertCanProcess(
                $request->user(),
                $approval->report,
                $approval->level
            );
            $this->approvalService->processApproval(
                $approval,
                $request->user(),
                ApprovalStatus::REJECTED,
                $request->validated()
            );
        } catch (Throwable $e) {
            Log::error('Gagal menolak laporan: ' . $e->getMessage());
            return Redirect::back()->withErrors(['message' => $e->getMessage()]);
        }

        return Redirect::back()->with('success', 'Laporan berhasil ditolak.');
    }
}