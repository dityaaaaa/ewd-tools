<?php

namespace App\Services;

use App\Models\Borrower;

class BorrowerService extends BaseService
{
    public function getAllBorrowers($perPage = 15, array $filters = [])
    {
        $this->authorize('view borrower');

        $query = Borrower::with('division')->latest();

        $q = trim((string)($filters['q'] ?? ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhereHas('division', function ($dq) use ($q) {
                        $dq->where('name', 'like', "%{$q}%")
                           ->orWhere('code', 'like', "%{$q}%");
                    });
            });
        }

        if (!empty($filters['division_id'])) {
            $query->where('division_id', $filters['division_id']);
        }

        return $query->paginate($perPage);
    }

    public function getBorrowerById(int $id): Borrower
    {
        $this->authorize('view borrower');

        return Borrower::with('division')->findOrFail($id);
    }

    public function store(array $data): Borrower
    {
        $this->authorize('create borrower');

        $borrower = Borrower::create($data);

        return $borrower;
    }

    public function update(Borrower $borrower, array $data): Borrower
    {
        $this->authorize('update borrower');

        $borrower->update($data);

        return $borrower;
    }

    public function destroy(Borrower $borrower): void
    {
        $this->authorize('delete borrower');

        $borrower->delete();
    }
}