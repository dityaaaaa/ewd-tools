<?php

use App\Enums\PeriodStatus;
use App\Models\Period;
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
        'email' => 'admin-period@test.local',
        'password' => Hash::make('password'),
    ]);
    $this->admin->assignRole('admin');
    $this->admin->update(['role_id' => $adminRole->id]);
});

test('period index loads', function () {
    actingAs($this->admin);
    get(route('periods.index'))
        ->assertStatus(200);
});

test('period store validates and creates', function () {
    actingAs($this->admin);

    // validation fail
    post(route('periods.store'), [])->assertSessionHasErrors(['name', 'start_date', 'status']);

    // success
    post(route('periods.store'), [
        'name' => 'Q1 2025',
        'start_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_date' => now()->addMonth()->toDateString(),
        'end_time' => '17:00',
        'status' => PeriodStatus::DRAFT->value,
    ])->assertRedirect(route('periods.index'))
      ->assertSessionHas('success');

    assertDatabaseHas('periods', ['name' => 'Q1 2025', 'status' => PeriodStatus::DRAFT->value]);
});

test('period update works', function () {
    actingAs($this->admin);
    $period = Period::create([
        'name' => 'QX',
        'start_date' => now(),
        'end_date' => now()->addDays(10),
        'status' => PeriodStatus::DRAFT->value,
        'created_by' => $this->admin->id,
    ]);

    put(route('periods.update', $period), [
        'name' => 'QX Updated',
    ])->assertRedirect(route('periods.index'))
      ->assertSessionHas('success');

    assertDatabaseHas('periods', ['id' => $period->id, 'name' => 'QX Updated']);
});

test('period start and stop transitions', function () {
    actingAs($this->admin);
    $period = Period::create([
        'name' => 'Q Transition',
        'start_date' => now(),
        'end_date' => now()->addDays(10),
        'status' => PeriodStatus::DRAFT->value,
        'created_by' => $this->admin->id,
    ]);

    // start
    post(route('periods.start', $period))
        ->assertRedirect()
        ->assertSessionHas('success');
    $period->refresh();
    expect($period->status)->toBe(PeriodStatus::ACTIVE);

    // stop
    post(route('periods.stop', $period))
        ->assertRedirect()
        ->assertSessionHas('success');
    $period->refresh();
    expect($period->status)->toBe(PeriodStatus::ENDED);
});

test('period destroy soft-deletes', function () {
    actingAs($this->admin);
    $period = Period::create([
        'name' => 'Q Delete',
        'start_date' => now(),
        'end_date' => now()->addDays(5),
        'status' => PeriodStatus::DRAFT->value,
        'created_by' => $this->admin->id,
    ]);

    delete(route('periods.destroy', $period))
        ->assertRedirect(route('periods.index'))
        ->assertSessionHas('success');

    assertSoftDeleted('periods', ['id' => $period->id]);
});