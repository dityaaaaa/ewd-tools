<?php

use App\Models\Borrower;
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
use function Pest\Laravel\assertSoftDeleted;

beforeEach(function () {
    Artisan::call('db:seed', ['--class' => Database\Seeders\RolePermissionSeeder::class]);
    $adminRole = Role::where('name', 'admin')->first();
    $this->admin = User::factory()->create([
        'name' => 'Admin Test',
        'email' => 'admin-borrower@test.local',
        'password' => Hash::make('password'),
    ]);
    $this->admin->assignRole('admin');
    $this->admin->update(['role_id' => $adminRole->id]);

    $this->division = Division::create(['code' => 'BRW', 'name' => 'Divisi Borrower']);
});

test('borrower index loads', function () {
    actingAs($this->admin);
    get(route('borrowers.index'))
        ->assertStatus(200);
});

test('borrower store validates and creates', function () {
    actingAs($this->admin);

    // validation fail
    post(route('borrowers.store'), [])->assertSessionHasErrors(['name', 'division_id']);

    // success
    post(route('borrowers.store'), [
        'name' => 'PT Test Debitur',
        'division_id' => $this->division->id,
    ])->assertRedirect(route('borrowers.index'))
      ->assertSessionHas('success');

    assertDatabaseHas('borrowers', ['name' => 'PT Test Debitur', 'division_id' => $this->division->id]);
});

test('borrower update works', function () {
    actingAs($this->admin);
    $borrower = Borrower::create(['name' => 'PT Lama', 'division_id' => $this->division->id]);

    put(route('borrowers.update', $borrower), [
        'name' => 'PT Baru',
        'division_id' => $this->division->id,
    ])->assertRedirect(route('borrowers.index'))
      ->assertSessionHas('success');

    assertDatabaseHas('borrowers', ['id' => $borrower->id, 'name' => 'PT Baru']);
});

test('borrower destroy soft-deletes', function () {
    actingAs($this->admin);
    $borrower = Borrower::create(['name' => 'To Delete', 'division_id' => $this->division->id]);

    delete(route('borrowers.destroy', $borrower))
        ->assertRedirect(route('borrowers.index'))
        ->assertSessionHas('success');

    assertSoftDeleted('borrowers', ['id' => $borrower->id]);
});