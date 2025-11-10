<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserService extends BaseService
{
    public function paginateUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $this->authorize('view user');

        $query = User::query()
            ->with(['division', 'role'])
            ->latest();

        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhereHas('role', fn ($r) => $r->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('division', fn ($d) => $d->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('division', fn ($d) => $d->where('code', 'like', "%{$q}%"));
            });
        }

        return $query->paginate($perPage);
    }

    public function getAllUsers()
    {
        $this->authorize('view user');

        return User::with(['division','role'])->latest()->get();
    }

    public function getUserById(int $id): User
    {
        $this->authorize('view user');

        return User::findOrFail($id);
    }

    public function store(array $data): User
    {
        $this->authorize('create user');

        $user = User::create($data);

        return $user;
    }

    public function update(User $user, array $data): User
    {
        $this->authorize('update user');

        $user->update($data);

        return $user;
    }

    public function destroy(User $user): void
    {
        $this->authorize('delete user');

        $user->delete();
    }
}