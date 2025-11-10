<?php

namespace App\Http\Controllers;

use App\Http\Requests\BorrowerRequest;
use App\Models\Borrower;
use App\Services\BorrowerService;
use App\Services\DivisionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class BorrowerController extends Controller
{
    protected BorrowerService $borrowerService;
    protected DivisionService $divisionService;

    public function __construct(
        BorrowerService $borrowerService,
        DivisionService $divisionService,
    ) {
        $this->borrowerService = $borrowerService;
        $this->divisionService = $divisionService;
    }

    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $filters = [
                'q' => $request->get('q'),
                'division_id' => $request->get('division_id'),
            ];
            $borrowers = $this->borrowerService->getAllBorrowers($perPage, $filters);
            $divisions = $this->divisionService->getDivisionsForFilters();
            return Inertia::render('borrower/index', [
                'borrowers' => $borrowers,
                'divisions' => $divisions,
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal memuat debitur: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat debitur.');
        }
    }

    public function create()
    {
        try {
            $divisions = $this->divisionService->getDivisionsForFilters();
            return Inertia::render('borrower/create', [
                'divisions' => $divisions
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal memuat form borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat form.');
        }
    }

    public function store(BorrowerRequest $request)
    {
        try {
            $this->borrowerService->store($request->validated());
            return redirect()->route('borrowers.index')->with('success', 'Debitur berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('Gagal menyimpan borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menyimpan debitur.');
        }
    }

    public function show(Borrower $borrower)
    {
        try {
            $data = $this->borrowerService->getBorrowerById($borrower->id);
            return Inertia::render('borrower/show', [
                'borrower' => $data,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal menampilkan debitur: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat debitur.');
        }
    }

    public function edit(Borrower $borrower)
    {
        try {
            $divisions = $this->divisionService->getDivisionsForFilters();
            return Inertia::render('borrower/edit', [
                'borrower' => $borrower->load('division'),
                'divisions' => $divisions,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal memuat form edit debitur: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat form.');
        };
    }

    public function update(BorrowerRequest $request, Borrower $borrower)
    {
        try {
            $this->borrowerService->update($borrower, $request->validated());
            return redirect()->route('borrowers.index')->with('success', 'Debitur berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui debitur: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memperbarui debitur.');
        }
    }

    public function destroy(Borrower $borrower)
    {
        try {
            $this->borrowerService->destroy($borrower);
            return redirect()->route('borrowers.index')->with('success', 'Debitur berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus debitur: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menghapus debitur.');
        }
    }
}
