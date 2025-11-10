<?php

namespace App\Services;

use App\Enums\ActionItemStatus;
use App\Enums\ActionItemType;
use App\Models\ActionItem;
use App\Models\MonitoringNote;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ActionItemService extends BaseService
{
    public function createActionItem(int $monitoringNoteId, array $data): ActionItem
    {
        $this->authorize('create action_items');

        return $this->tx(function () use ($monitoringNoteId, $data) {
            $actionItem = ActionItem::create([
                'monitoring_note_id'      => $monitoringNoteId,
                'action_description'      => $data['action_description'],
                'item_type'               => $data['item_type'] ?? ActionItemType::NEXT_PERIOD->value,
                'progress_notes'          => $data['progress_notes'] ?? '',
                'people_in_charge'        => $data['people_in_charge'] ?? '',
                'notes'                   => $data['notes'] ?? '',
                'due_date'                => $data['due_date'] ?? null,
                'status'                  => $data['status'] ?? ActionItemStatus::PENDING->value,
                'previous_action_item_id' => $data['previous_action_item_id'] ?? null,
                'created_by'              => Auth::id(),
                'updated_by'              => Auth::id(),
            ]);

            return $actionItem;
        });
    }

    public function updateActionItem(int $actionItemId, array $data): ActionItem
    {
        $this->authorize('update action_items');

        return $this->tx(function () use ($actionItemId, $data) {
            $actionItem = ActionItem::findOrFail($actionItemId);
            $before = $actionItem->toArray();

            $updateData = array_filter([
                'action_description' => $data['action_description'] ?? null,
                'progress_notes'     => $data['progress_notes'] ?? null,
                'people_in_charge'   => $data['people_in_charge'] ?? null,
                'notes'              => $data['notes'] ?? null,
                'due_date'           => $data['due_date'] ?? null,
                'completion_date'    => $data['completion_date'] ?? null,
                'status'             => $data['status'] ?? null,
                'updated_by'         => Auth::id(),
            ], fn($v) => $v !== null);

            $actionItem->update($updateData);

            return $actionItem->fresh();
        });
    }

    public function deleteActionItem(int $actionItemId): bool
    {
        $this->authorize('delete action_items');

        return $this->tx(function () use ($actionItemId) {
            $actionItem = ActionItem::findOrFail($actionItemId);
            $id = $actionItem->id;
            $result = $actionItem->delete();

            return $result;
        });
    }

    public function copyFromPreviousPeriod(int $monitoringNoteId, int $borrowerId): Collection
    {
        $this->authorize('create action_items');

        return $this->tx(function () use ($monitoringNoteId, $borrowerId) {
            $previousNote = MonitoringNote::whereHas('watchlist', fn($q) =>
                    $q->where('borrower_id', $borrowerId))
                ->where('id', '!=', $monitoringNoteId)
                ->with('actionItems')
                ->latest('created_at')
                ->first();

            if (!$previousNote) {
                return new Collection();
            }

            $copiedItems = new Collection();

            foreach ($previousNote->actionItems as $item) {
                $newItem = ActionItem::create([
                    'monitoring_note_id'      => $monitoringNoteId,
                    'action_description'      => $item->action_description,
                    'item_type'               => ActionItemType::PREVIOUS_PERIOD->value,
                    'progress_notes'          => '',
                    'people_in_charge'        => $item->people_in_charge,
                    'notes'                   => $item->notes ?? '',
                    'due_date'                => $item->due_date,
                    'status'                  => ActionItemStatus::PENDING->value,
                    'previous_action_item_id' => $item->id,
                    'created_by'              => Auth::id(),
                    'updated_by'              => Auth::id(),
                ]);

                $copiedItems->push($newItem);
            }
            
            return $copiedItems;
        });
    }
}
