<?php

namespace App\Http\Controllers;

use App\Http\Requests\DivisionRequest;
use App\Models\Division;
use App\Services\DivisionService;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class DivisionController extends Controller
{
    protected DivisionService $divisionService;

    public function __construct(
        DivisionService $divisionService,
    ) {
        $this->divisionService = $divisionService;
    }

    public function index()
    {
        try {
            $divisions = $this->divisionService->getAllDivisions();
            return Inertia::render('division/index', [
                'divisions' => $divisions,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal memuat divisions: ' . $e->getMessage());
            return back()->with('error', 'Gagal memuat daftar division.');
        }
    }

    public function create()
    {
        return Inertia::render('division/create');
    }

    public function store(DivisionRequest $request)
    {
        try {
            $this->divisionService->store($request->validated());
            return redirect()->route('divisions.index')->with('success', 'Division berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan division: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menyimpan division.');
        }
    }

    public function show(Division $division)
    {
        $data = $this->divisionService->getDivisionById($division->id);
        return Inertia::render('division/show', [
            'division' => $data,
        ]);
    }

    public function edit(Division $division)
    {
        return Inertia::render('division/edit', [
            'division' => $division,
        ]);
    }

    public function update(DivisionRequest $request, Division $division)
    {
        try {
            $this->divisionService->update($division, $request->validated());
            return redirect()->route('divisions.index')->with('success', 'Division berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui division: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memperbarui division.');
        }
    }

    public function destroy(Division $division)
    {
        try {
            $this->divisionService->destroy($division);
            return redirect()->route('divisions.index')->with('success', 'Division berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus division: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menghapus division.');
        }
    }

}
