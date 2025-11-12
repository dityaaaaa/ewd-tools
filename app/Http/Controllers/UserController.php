<?php
namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Throwable;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(
        UserService $userService,
    ) {
        $this->userService = $userService;
    }

    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $filters = $request->only(['q', 'division_id', 'role', 'role_id']);

            $users = $this->userService->paginateUsers($filters, $perPage);
            $divisions = Division::latest()->get();
            $roles = Role::all();

            return Inertia::render('user/index', [
                'users' => $users,
                'divisions' => $divisions,
                'roles' => $roles,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal memuat pengguna: ' . $e->getMessage());
            return back()->with('error', 'Gagal memuat daftar pengguna.');
        }
    }

    public function create()
    {
        $divisions = Division::latest()->get();
        $roles = Role::all();

        return Inertia::render('user/create', [
            'divisions' => $divisions,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        try {
            $this->userService->store($validated);
            return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan.');
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan pengguna: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menyimpan pengguna');
        }
    }

    public function show(User $user)
    {
        return Inertia::render('user/show', [
            'user' => $user->load(['division', 'role', 'roles']),
        ]);
    }

    public function edit(User $user)
    {
        $divisions = Division::latest()->get();
        $roles = Role::all();

        return Inertia::render('user/edit', [
            'user' => $user->load(['division', 'role', 'roles']),
            'divisions' => $divisions,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        };

        try {
            $this->userService->update($user, $validated);
            return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui pengguna: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memperbarui pengguna');
        }
    }

    public function destroy(User $user)
    {
        try {
            $this->userService->destroy($user);
            return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Gagal menghapus pengguna: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menghapus pengguna');
        }
    }
}
