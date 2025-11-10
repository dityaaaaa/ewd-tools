<?php

namespace App\Services;

use App\Models\Division;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;

class DivisionService extends BaseService
{
    public function paginateDivisions(array $filters = [], int $perPage = 15)
    {
        $this->authorize('view division');

        $query = Division::query()->latest();

        $q = trim((string)($filters['q'] ?? ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function getAllDivisions()
    {
        $this->authorize('view division');

        return Division::latest()->get();
    }

    /**
     * Mengembalikan daftar divisi untuk kebutuhan filter/select tanpa mewajibkan permission penuh.
     * - Jika user punya izin 'view division', kembalikan semua divisi.
     * - Jika tidak, kembalikan hanya divisi milik user (jika ada).
     * - Jika user tidak punya divisi, kembalikan koleksi kosong.
     */
    public function getDivisionsForFilters(): Collection
    {
        $actor = Auth::user();
        if ($actor && $actor->can('view division')) {
            return Division::latest()->get();
        }

        if ($actor && $actor->division_id) {
            return Division::where('id', $actor->division_id)->get();
        }

        return collect();
    }

    public function getDivisionById(int $id): Division
    {
        $this->authorize('view division');

        return Division::findOrFail($id);
    }

    public function store(array $data): Division
    {
        $this->authorize('create division');

        $division = Division::create($data);

        return $division;
    }

    public function update(Division $division, array $data): Division
    {
        $this->authorize('update division');

        $division->update($data);


        return $division;
    }

    public function destroy(Division $division): void
    {
        $this->authorize('delete division');

        $division->delete();

    }
}