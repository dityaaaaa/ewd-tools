<?php

namespace App\Services;

use App\Models\Period;
use App\Enums\PeriodStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PeriodService
{
    /**
     * Get all periods with created_by relation
     */
    public function getAllPeriods()
    {
        return Period::with('createdBy')->orderBy('start_date', 'desc')->get();
    }

    public function getPeriodById(int $id): Period
    {
        return Period::findOrFail($id);
    }

    /**
     * Create a new period
     */
    public function create(array $data): Period
    {
        return DB::transaction(function () use ($data) {
            $startDate = $this->combineDateTime($data['start_date'], $data['start_time'] ?? '00:00');
            $endDate = isset($data['end_date'])
                ? $this->combineDateTime($data['end_date'], $data['end_time'] ?? '23:59')
                : null;
            
            return Period::create([
                'name' => $data['name'],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'created_by' => Auth::id(),
                'status' => PeriodStatus::DRAFT,
            ]);
        });
    }

    /**
     * Update period (including status change)
     */
    public function update(Period $period, array $data): Period
    {
        return DB::transaction(function () use ($period, $data) {
            if (isset($data['status']) && PeriodStatus::from($data['status']) !== $period->status) {
                $this->transitionStatus($period, PeriodStatus::from($data['status']));
            }

            $updateData = collect($data)->except(['status', 'start_time', 'end_time'])->toArray();

            if (isset($data['start_date'])) {
                $updateData['start_date'] = $this->combineDateTime($data['start_date'], $data['start_time'] ?? '00:00');
            }
            if (isset($data['end_date'])) {
                $updateData['end_date'] = $this->combineDateTime($data['end_date'], $data['end_time'] ?? '23:59');
            }

            $period->update($updateData);
            return $period->fresh();
        });
    }

    /**
     * Transition status with business logic validation
     */
    public function transitionStatus(Period $period, PeriodStatus $newStatus): void
    {
        match ($newStatus) {
            PeriodStatus::ACTIVE => $this->markAsActive($period),
            PeriodStatus::DRAFT => $period->update(['status' => PeriodStatus::DRAFT]),
            PeriodStatus::ENDED => $this->markAsEnded($period),
            PeriodStatus::EXPIRED => $this->markAsExpired($period),
        };
    }

    public function markAsActive(Period $period): void
    {
        if ($period->start_date->isFuture()) {
            throw ValidationException::withMessages([
                'error' => 'Periode belum bisa diaktifkan karena belum dimulai.'
            ]);
        }

        $alreadyActive = Period::where('status', PeriodStatus::ACTIVE)
            ->where('id', '!=', $period->id)
            ->exists();

        if ($alreadyActive) {
            throw ValidationException::withMessages([
                'error' => 'Tidak bisa memulai periode baru. Harap selesaikan periode yang sedang aktif terlebih dahulu.'
            ]);
        }

        $period->update(['status' => PeriodStatus::ACTIVE]);
        Cache::forget('periods:active');
    }

    public function markAsEnded(Period $period): void
    {
        $period->update([
            'status'   => PeriodStatus::ENDED,
            'end_date' => now(),
        ]);
    }

    public function markAsExpired(Period $period): void
    {
        $period->update(['status' => PeriodStatus::EXPIRED]);
    }

    /**
     * Extend period end date
     */
    public function extend(Period $period, string $newEndDate): Period
    {
        $period->update(['end_date' => Carbon::parse($newEndDate)]);
        return $period;
    }

    /**
     * Bulk check for expired periods
     */
    public function checkAndMarkExpired(): int
    {
        $expired = Period::where('status', PeriodStatus::ACTIVE)
            ->where('end_date', '<', now())
            ->get();

        foreach ($expired as $period) {
            $this->markAsExpired($period);
            Log::info("Period '{$period->name}' automatically marked as expired.");
        }

        return $expired->count();
    }

    /**
     * Utility: combine date and time string
     */
    protected function combineDateTime(string $date, string $time): Carbon
    {
        return Carbon::parse("{$date} {$time}");
    }

    /**
     * Get currently active period (cached)
     */
    public function getActivePeriod(): ?Period
    {
        return Cache::remember('periods:active', now()->addMinutes(5), function () {
            return Period::where('status', PeriodStatus::ACTIVE)
                ->whereDate('start_date', '<=', now())
                ->whereDate('end_date', '>=', now())
                ->first();
        });
    }
}