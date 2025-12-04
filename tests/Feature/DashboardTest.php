<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

// Period Comparison Tests

test('dashboard includes available periods', function () {
    $user = User::factory()->create();
    \App\Models\Period::factory()->count(3)->create();
    
    $response = $this->actingAs($user)->get(route('dashboard'));
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->has('availablePeriods', 3)
    );
});

test('dashboard accepts valid period parameters', function () {
    $user = User::factory()->create();
    $period1 = \App\Models\Period::factory()->create();
    $period2 = \App\Models\Period::factory()->create();
    
    $response = $this->actingAs($user)->get(route('dashboard', [
        'period1' => $period1->id,
        'period2' => $period2->id
    ]));
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->where('selectedPeriods.period1', $period1->id)
             ->where('selectedPeriods.period2', $period2->id)
             ->has('comparisonData')
    );
});

test('dashboard rejects invalid period IDs', function () {
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->get(route('dashboard', [
        'period1' => 9999,
        'period2' => 9998
    ]));
    
    $response->assertStatus(302); // Redirect due to validation error
    $response->assertSessionHasErrors(['period1']);
});

test('dashboard rejects duplicate period IDs', function () {
    $user = User::factory()->create();
    $period = \App\Models\Period::factory()->create();
    
    $response = $this->actingAs($user)->get(route('dashboard', [
        'period1' => $period->id,
        'period2' => $period->id
    ]));
    
    $response->assertStatus(302); // Redirect due to validation error
    $response->assertSessionHasErrors(['period2']);
});

test('dashboard works without period parameters', function () {
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->get(route('dashboard'));
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->where('selectedPeriods.period1', null)
             ->where('selectedPeriods.period2', null)
             ->where('comparisonData', null)
    );
});

test('dashboard rejects non-integer period values', function () {
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->get(route('dashboard', [
        'period1' => 'abc',
        'period2' => 'def'
    ]));
    
    $response->assertStatus(302); // Redirect due to validation error
    $response->assertSessionHasErrors(['period1']);
});