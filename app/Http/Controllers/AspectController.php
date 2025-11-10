<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAspectRequest;
use App\Http\Requests\UpdateAspectRequest;
use App\Models\Aspect;
use App\Services\AspectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class AspectController extends Controller
{
    protected AspectService $aspectService;

    public function __construct(
        AspectService $aspectService,
    ) {
        $this->aspectService = $aspectService;
    }

    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $filters = [
                'q' => $request->get('q'),
            ];
            $aspects = $this->aspectService->getAllAspects($perPage, $filters);
            return Inertia::render('aspect/index', [
                'aspects' => $aspects,
                'filters' => $filters,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal memuat aspek pertanyaan: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat aspek pertanyaan.');
        }
    }

    public function create()
    {
        return Inertia::render('aspect/create');
    }

    public function store(StoreAspectRequest $request)
    {
        try {
            $this->aspectService->store($request->validated());
            return redirect()->route('aspects.index')->with('success', 'Aspek berhasil dibuat.');
        } catch (Throwable $e) {
            Log::error('Error storing aspect', ['exception' => $e]);
            return back()->with('error', 'Terjadi kesalahan saat menyimpan data.');
        }
    }

    public function show(Aspect $aspect)
    {
        $aspect = $this->aspectService->getAspectById($aspect->id);
        return Inertia::render('aspect/show', ['aspect' => $aspect]);
    }

    public function edit(Aspect $aspect)
    {
        $aspect = $this->aspectService->getAspectById($aspect->id);
        return Inertia::render('aspect/edit', ['aspect' => $aspect]);
    }

    public function update(UpdateAspectRequest $request, Aspect $aspect)
    {
        try {
            $this->aspectService->update($request->validated(), $aspect);
            return redirect()->route('aspects.index')->with('success', 'Aspek berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Error updating aspect', ['exception' => $e]);
            return back()->with('error', 'Terjadi kesalahan saat memperbarui data.');
        }
    }

    public function destroy(Aspect $aspect)
    {
        try {
            $this->aspectService->destroy($aspect);
            return redirect()->route('aspects.index')->with('success', 'Aspek berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus aspek: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menghapus aspek.');
        }
    }
}