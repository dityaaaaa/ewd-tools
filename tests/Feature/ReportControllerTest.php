<?php

use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    // Seed minimal data for reports
    Artisan::call('db:seed', ['--class' => Database\Seeders\RolePermissionSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\DivisionSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\AdminSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\TemplateSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\BorrowerSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\PeriodSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\ReportSeeder::class]);

    $adminRole = Role::where('name', 'admin')->first();
    $this->admin = User::query()->role('admin')->first();
    if (!$this->admin) {
        $this->admin = User::factory()->create([
            'name' => 'Admin Test',
            'email' => 'admin-report@test.local',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');
        if ($adminRole) {
            $this->admin->update(['role_id' => $adminRole->id]);
        }
    }
});

test('report index loads with filters', function () {
    actingAs($this->admin);

    get(route('reports.index', ['q' => 'PT', 'per_page' => 10]))
        ->assertStatus(200);
});

test('report show loads a report', function () {
    actingAs($this->admin);
    $report = Report::first();
    expect($report)->not->toBeNull();

    get(route('reports.show', $report->id))
        ->assertStatus(200);
});