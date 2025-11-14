<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitApprovalRequest;
use App\Enums\Classification;
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

        Log::info('Summary update request', [
            'report_id' => $report->id,
            'actor_id' => $actor?->id,
            'payload' => [
                'business_notes' => $request->validated()['business_notes'] ?? null,
                'reviewer_notes' => $request->validated()['reviewer_notes'] ?? null,
                'is_override' => $request->validated()['is_override'] ?? null,
                'final_classification_value' => $request->validated()['final_classification'] ?? null,
                'final_classification_label' => is_int($request->validated()['final_classification'] ?? null)
                    ? Classification::tryFrom($request->validated()['final_classification'])?->name
                    : (is_string($request->validated()['final_classification'] ?? null)
                        ? strtoupper($request->validated()['final_classification'])
                        : null),
                'override_reason' => $request->validated()['override_reason'] ?? null,
            ],
        ]);

        $summary = $this->approvalService->updateSummary(
            $report,
            $actor,
            $request->validated()
        );

        Log::info('Summary updated', [
            'summary_id' => $summary->id,
            'report_id' => $report->id,
            'final_classification_value' => $summary->final_classification?->value,
            'final_classification_label' => $summary->final_classification?->name,
            'is_override' => (bool)$summary->is_override,
            'override_by' => $summary->override_by,
            'override_reason' => $summary->override_reason,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'summary' => $summary,
            ]);
        }

        return redirect()->route('summary.show', $report)->with('success', 'Summary berhasil diperbarui.');
    }
}
