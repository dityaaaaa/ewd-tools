<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create(
            [
                'name' => 'Administrator',
                'email' => 'admin@ewd.test',
                'password' => Hash::make('password'),
                'division_id' => null,
            ]
            );

        $roleId = Role::where('name', 'admin')->first();
        $user->assignRole('admin');
        $user->update(['role_id' => $roleId->id]);
    }
}
