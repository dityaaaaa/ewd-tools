<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePeriodRequest;
use App\Http\Requests\UpdatePeriodRequest;
use App\Models\Period;
use App\Enums\PeriodStatus;
use App\Services\PeriodService;
use Exception;
use Inertia\Inertia;

class PeriodController extends Controller
{
    protected PeriodService $periodService;

    public function __construct(
        PeriodService $periodService,
    ) {
        $this->periodService = $periodService;
    }

    public function index()
    {
        $periods = $this->periodService->getAllPeriods();

        return Inertia::render('period/index', [
            'periods' => $periods,
            'status_options' => PeriodStatus::toSelectOptions(),
        ]);
    }

    public function create()
    {
        return Inertia::render('period/create', [
            'status_options' => PeriodStatus::toSelectOptions(),
        ]);
    }

    public function store(StorePeriodRequest $request)
    {
        $this->periodService->create($request->validated());

        return redirect()->route('periods.index')->with('success', 'Periode berhasil dibuat.');
    }

    public function show(Period $period)
    {
        $period->load('createdBy');

        return Inertia::render('period/show', [
            'period' => $period,
            'is_active' => $period->status == PeriodStatus::ACTIVE,
            'remaining_time' =>$period->end_date
                ? now()->diff($period->end_date)->format('%a hari, %h jam, %i menit')
                : null,
        ]);
    }

    public function edit(Period $period)
    {
        $period->load('createdBy');

        return Inertia::render('period/edit', [
            'period' => $period,
            'status_options' => PeriodStatus::toSelectOptions(),
        ]);
    }

    public function update(UpdatePeriodRequest $request, Period $period)
    {
        $this->periodService->update($period, $request->validated());

        return redirect()->route('periods.index')->with('success', 'Periode berhasil diperbarui.');
    }

    public function destroy(Period $period)
    {
        $period->delete();

        return redirect()->route('periods.index')->with('success', 'Periode berhasil dihapus.');
    }

    public function start(Period $period)
    {
        try {
            $this->periodService->markAsActive($period);
            return redirect()->back()->with('success', 'Periode berhasil dimulai.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function stop(Period $period)
    {
        try {
            $this->periodService->markAsEnded($period);
            return redirect()->back()->with('success', 'Periode berhasil diakhiri.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
