<?php

namespace App\Http\Controllers;

use App\Models\ActionItem;
use App\Models\MonitoringNote;
use App\Models\Report;
use App\Services\ActionItemService;
use App\Services\MonitoringNoteService;
use App\Enums\WatchlistStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WatchlistController extends Controller
{
    protected MonitoringNoteService $monitoringNoteService;
    protected ActionItemService $actionItemService;

    public function __construct(
        MonitoringNoteService $monitoringNoteService,
        ActionItemService $actionItemService
    ) {
        $this->monitoringNoteService = $monitoringNoteService;
        $this->actionItemService = $actionItemService;
    }

    public function show(Request $request)
    {
        $reportId = $request->query('reportId');

        if (!$reportId) {
            abort(400, 'Report ID is required');
        }

        try {
            $monitoringNoteData = $this->monitoringNoteService->getMonitoringNoteData($reportId);
            return Inertia::render('watchlist-note', $monitoringNoteData);
        } catch (Exception $e) {
            abort(400, $e->getMessage());
        }
    }

    public function update(Request $request, MonitoringNote $monitoringNote)
    {
        $validated = $request->validate([
            'watchlist_reason' => 'nullable|string|max:1000',
            'account_strategy' => 'nullable|string|max:1000',
        ]);

        $validated['updated_by'] = Auth::id();

        $monitoringNote->update($validated);

        return back()->with('success', 'Monitoring note berhasil diperbarui.');
    }

    public function storeActionItem(Request $request, MonitoringNote $monitoringNote)
    {
        $validated = $request->validate([
            'action_description' => 'required|string|max:500',
            'item_type'          => 'required|in:previous_period,current_progress,next_period',
            'progress_notes'     => 'nullable|string|max:1000',
            'people_in_charge'   => 'nullable|string|max:255',
            'notes'              => 'nullable|string|max:1000',
            'due_date'           => 'nullable|date',
            'status'             => 'required|in:pending,in_progress,completed,overdue',
        ]);

        $actionItem = $this->actionItemService->createActionItem($monitoringNote->id, $validated);

        return back()->with('success', 'Action item berhasil ditambahkan.');
    }

    public function updateActionItem(Request $request, ActionItem $actionItem)
    {
        $validated = $request->validate([
            'action_description' => 'required|string|max:500',
            'item_type'          => 'nullable|in:previous_period,current_progress,next_period',
            'progress_notes'     => 'nullable|string|max:1000',
            'people_in_charge'   => 'nullable|string|max:255',
            'notes'              => 'nullable|string|max:1000',
            'due_date'           => 'nullable|date',
            'status'             => 'required|in:pending,in_progress,completed,overdue',
        ]);

        $actionItem = $this->actionItemService->updateActionItem($actionItem->id, $validated);

        return back()->with('success', 'Action item berhasil diperbarui.');
    }

    public function deleteActionItem(ActionItem $actionItem)
    {
        $this->actionItemService->deleteActionItem($actionItem->id);

        return back()->with('success', 'Action item berhasil dihapus.');
    }

    public function submit(Request $request, MonitoringNote $monitoringNote)
    {
        try {
            DB::beginTransaction();

            $isComplete = $this->monitoringNoteService->validateCompletion($monitoringNote);

            if (!$isComplete['is_complete']) {
                return back()->with('error', 'NAW belum lengkap: ' . implode(', ', $isComplete['missing_items']));
            }

            $watchlist = $monitoringNote->watchlist;
            $watchlist->update([
                'status' => 'submitted',
                'submitted_by' => Auth::id(),
                'submitted_at' => now()
            ]);

            $monitoringNote->update([
                'status' => 'submitted',
                'submitted_at' => now()
            ]);

            DB::commit();

            return redirect()->with('success', 'NAW berhasil dibuat.');
        } catch (Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Terjadi kesalahan saat submit NAW: ' . $e->getMessage());
        }
    }
}
