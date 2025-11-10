<?php

use App\Models\Aspect;
use App\Models\Template;
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
    Artisan::call('db:seed', ['--class' => Database\Seeders\AspectSeeder::class]);
    $adminRole = Role::where('name', 'admin')->first();
    $this->admin = User::factory()->create([
        'name' => 'Admin Test',
        'email' => 'admin-template@test.local',
        'password' => Hash::make('password'),
    ]);
    $this->admin->assignRole('admin');
    $this->admin->update(['role_id' => $adminRole->id]);
});

test('template index loads', function () {
    actingAs($this->admin);
    get(route('templates.index'))
        ->assertStatus(200);
});

test('template store validates and creates', function () {
    actingAs($this->admin);

    // validation fail (missing name and selected_aspects)
    post(route('templates.store'), [])->assertSessionHasErrors(['name', 'selected_aspects']);

    $aspects = Aspect::take(2)->get();
    $selected = $aspects->map(fn($a) => ['id' => $a->id, 'weight' => 50])->toArray();

    post(route('templates.store'), [
        'name' => 'Template Uji',
        'description' => 'Deskripsi',
        'selected_aspects' => $selected,
        'visibility_rules' => [
            [
                'description' => 'Only for test',
                'source_type' => 'borrower_detail',
                'source_field' => 'collectibility',
                'operator' => '==',
                'value' => '1',
            ]
        ]
    ])->assertRedirect(route('templates.index'))
      ->assertSessionHas('success');

    $template = Template::latest()->first();
    assertDatabaseHas('template_versions', ['template_id' => $template->id, 'name' => 'Template Uji']);
});

test('template update creates new version', function () {
    actingAs($this->admin);

    // Create base template
    $aspect = Aspect::first();
    post(route('templates.store'), [
        'name' => 'Base Template',
        'selected_aspects' => [['id' => $aspect->id, 'weight' => 100]],
    ])->assertRedirect(route('templates.index'));

    $template = Template::latest()->first();
    $latestVersion = $template->latestTemplateVersion;

    // Update with new aspects (same one different weight)
    put(route('templates.update', $template), [
        'name' => 'Updated Template',
        'selected_aspects' => [['id' => $aspect->id, 'weight' => 80]],
    ])->assertRedirect(route('templates.index'))
      ->assertSessionHas('success');

    $template->refresh();
    expect($template->latestTemplateVersion->version_number)->toBe($latestVersion->version_number + 1);
    assertDatabaseHas('template_versions', ['template_id' => $template->id, 'name' => 'Updated Template']);
});

test('template destroy deletes record', function () {
    actingAs($this->admin);

    $aspect = Aspect::first();
    post(route('templates.store'), [
        'name' => 'Delete Me',
        'selected_aspects' => [['id' => $aspect->id, 'weight' => 100]],
    ]);

    $template = Template::latest()->first();

    delete(route('templates.destroy', $template))
        ->assertRedirect(route('templates.index'))
        ->assertSessionHas('success');

    assertDatabaseMissing('templates', ['id' => $template->id]);
});