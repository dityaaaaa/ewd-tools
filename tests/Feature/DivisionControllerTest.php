<?php

use App\Models\Division;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;
use function Pest\Laravel\delete;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    Artisan::call('db:seed', ['--class' => Database\Seeders\RolePermissionSeeder::class]);
    $adminRole = Role::where('name', 'admin')->first();
    $this->admin = User::factory()->create([
        'name' => 'Admin Test',
        'email' => 'admin@test.local',
        'password' => Hash::make('password'),
    ]);
    $this->admin->assignRole('admin');
    $this->admin->update(['role_id' => $adminRole->id]);
});

test('division index loads', function () {
    actingAs($this->admin);
    get(route('divisions.index'))
        ->assertStatus(200);
});

test('division store validates and creates', function () {
    actingAs($this->admin);

    // validation fail
    post(route('divisions.store'), [])->assertSessionHasErrors(['code', 'name']);

    // success
    post(route('divisions.store'), [
        'code' => 'TST',
        'name' => 'Divisi Test',
    ])->assertRedirect(route('divisions.index'))
      ->assertSessionHas('success');

    assertDatabaseHas('divisions', ['code' => 'TST', 'name' => 'Divisi Test']);
});

test('division update works', function () {
    actingAs($this->admin);
    $division = Division::create(['code' => 'ABC', 'name' => 'Divisi ABC']);

    put(route('divisions.update', $division), [
        'code' => 'XYZ',
        'name' => 'Divisi XYZ',
    ])->assertRedirect(route('divisions.index'))
      ->assertSessionHas('success');

    assertDatabaseHas('divisions', ['id' => $division->id, 'code' => 'XYZ']);
});

test('division destroy deletes record', function () {
    actingAs($this->admin);
    $division = Division::create(['code' => 'DEL', 'name' => 'To Delete']);

    delete(route('divisions.destroy', $division))
        ->assertRedirect(route('divisions.index'))
        ->assertSessionHas('success');

    assertDatabaseMissing('divisions', ['id' => $division->id]);
});