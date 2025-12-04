<?php

use App\Services\DashboardService;
use App\Models\User;
use App\Models\Period;
use App\Models\Report;
use App\Models\Watchlist;
use App\Models\Borrower;
use App\Models\Division;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(DashboardService::class);
});

// Feature: admin-period-comparison, Property 5: Percentage change calculation
test('percentage change calculation is correct for any pair of numeric values', function () {
    // Test with various combinations of current and previous values
    $testCases = [
        // [current, previous, expected_value, expected_direction]
        [100, 50, 100.0, 'up'],           // 100% increase
        [50, 100, -50.0, 'down'],         // 50% decrease
        [100, 100, 0.0, 'neutral'],       // No change
        [150, 100, 50.0, 'up'],           // 50% increase
        [75, 100, -25.0, 'down'],         // 25% decrease
        [200, 100, 100.0, 'up'],          // 100% increase
        [0, 100, -100.0, 'down'],         // 100% decrease
        [100, 0, 100, 'up'],              // From zero (special case)
        [0, 0, 0, 'neutral'],             // Both zero
        [1000, 500, 100.0, 'up'],         // Large numbers
        [1, 3, -66.67, 'down'],           // Decimal result
    ];

    foreach ($testCases as [$current, $previous, $expectedValue, $expectedDirection]) {
        $result = invokePrivateMethod($this->service, 'calculatePercentageChange', [$current, $previous]);
        
        expect($result)->toBeArray()
            ->and($result)->toHaveKeys(['value', 'direction'])
            ->and($result['value'])->toEqual($expectedValue)
            ->and($result['direction'])->toBe($expectedDirection);
    }
});

test('percentage change handles zero previous value correctly', function () {
    $result = invokePrivateMethod($this->service, 'calculatePercentageChange', [100, 0]);
    
    expect($result['value'])->toEqual(100)
        ->and($result['direction'])->toBe('up');
    
    $result = invokePrivateMethod($this->service, 'calculatePercentageChange', [0, 0]);
    
    expect($result['value'])->toEqual(0)
        ->and($result['direction'])->toBe('neutral');
});

test('percentage change rounds to 2 decimal places', function () {
    $result = invokePrivateMethod($this->service, 'calculatePercentageChange', [1, 3]);
    
    expect($result['value'])->toBe(-66.67);
    
    $result = invokePrivateMethod($this->service, 'calculatePercentageChange', [2, 3]);
    
    expect($result['value'])->toBe(-33.33);
});

// Feature: admin-period-comparison, Property 10: Period filtering accuracy
test('reports are filtered correctly by period', function () {
    // Create test data
    $user = User::factory()->create();
    $division = Division::factory()->create();
    $borrower = Borrower::factory()->create(['division_id' => $division->id]);
    
    $period1 = Period::factory()->create(['name' => 'Period 1']);
    $period2 = Period::factory()->create(['name' => 'Period 2']);
    $period3 = Period::factory()->create(['name' => 'Period 3']);
    
    // Create reports for different periods
    Report::factory()->count(5)->create([
        'period_id' => $period1->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    Report::factory()->count(3)->create([
        'period_id' => $period2->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    Report::factory()->count(7)->create([
        'period_id' => $period3->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    // Test that each period returns only its reports
    $count1 = invokePrivateMethod($this->service, 'getReportsCountByPeriod', [$period1->id]);
    $count2 = invokePrivateMethod($this->service, 'getReportsCountByPeriod', [$period2->id]);
    $count3 = invokePrivateMethod($this->service, 'getReportsCountByPeriod', [$period3->id]);
    
    expect($count1)->toBe(5)
        ->and($count2)->toBe(3)
        ->and($count3)->toBe(7);
});

test('watchlist items are filtered correctly by period', function () {
    // Create test data
    $user = User::factory()->create();
    $division = Division::factory()->create();
    $borrower = Borrower::factory()->create(['division_id' => $division->id]);
    
    $period1 = Period::factory()->create(['name' => 'Period 1']);
    $period2 = Period::factory()->create(['name' => 'Period 2']);
    
    // Create reports for different periods
    $report1 = Report::factory()->create([
        'period_id' => $period1->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    $report2 = Report::factory()->create([
        'period_id' => $period2->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    // Create watchlist items
    Watchlist::factory()->count(4)->create([
        'report_id' => $report1->id,
        'borrower_id' => $borrower->id,
        'added_by' => $user->id
    ]);
    
    Watchlist::factory()->count(2)->create([
        'report_id' => $report2->id,
        'borrower_id' => $borrower->id,
        'added_by' => $user->id
    ]);
    
    // Test that each period returns only its watchlist items
    $count1 = invokePrivateMethod($this->service, 'getWatchlistCountByPeriod', [$period1->id]);
    $count2 = invokePrivateMethod($this->service, 'getWatchlistCountByPeriod', [$period2->id]);
    
    expect($count1)->toBe(4)
        ->and($count2)->toBe(2);
});

test('reports by division are filtered correctly by period', function () {
    // Create test data
    $user = User::factory()->create();
    $division1 = Division::factory()->create(['code' => 'DIV1']);
    $division2 = Division::factory()->create(['code' => 'DIV2']);
    
    $borrower1 = Borrower::factory()->create(['division_id' => $division1->id]);
    $borrower2 = Borrower::factory()->create(['division_id' => $division2->id]);
    
    $period1 = Period::factory()->create(['name' => 'Period 1']);
    $period2 = Period::factory()->create(['name' => 'Period 2']);
    
    // Create reports for period 1
    Report::factory()->count(3)->create([
        'period_id' => $period1->id,
        'borrower_id' => $borrower1->id,
        'created_by' => $user->id
    ]);
    
    Report::factory()->count(2)->create([
        'period_id' => $period1->id,
        'borrower_id' => $borrower2->id,
        'created_by' => $user->id
    ]);
    
    // Create reports for period 2
    Report::factory()->count(5)->create([
        'period_id' => $period2->id,
        'borrower_id' => $borrower1->id,
        'created_by' => $user->id
    ]);
    
    Report::factory()->count(1)->create([
        'period_id' => $period2->id,
        'borrower_id' => $borrower2->id,
        'created_by' => $user->id
    ]);
    
    // Test period 1
    $result1 = invokePrivateMethod($this->service, 'getReportsByPeriodAndDivision', [$period1->id]);
    expect($result1)->toBeArray()
        ->and($result1['DIV1'])->toBe(3)
        ->and($result1['DIV2'])->toBe(2);
    
    // Test period 2
    $result2 = invokePrivateMethod($this->service, 'getReportsByPeriodAndDivision', [$period2->id]);
    expect($result2)->toBeArray()
        ->and($result2['DIV1'])->toBe(5)
        ->and($result2['DIV2'])->toBe(1);
});

// Unit tests for DashboardService comparison methods

test('getAvailablePeriods returns all periods ordered by start date', function () {
    // Create periods with different start dates
    Period::factory()->create(['name' => 'Period 1', 'start_date' => now()->subMonths(3)]);
    Period::factory()->create(['name' => 'Period 2', 'start_date' => now()->subMonths(1)]);
    Period::factory()->create(['name' => 'Period 3', 'start_date' => now()->subMonths(2)]);
    
    $periods = $this->service->getAvailablePeriods();
    
    expect($periods)->toBeArray()
        ->and(count($periods))->toBe(3)
        ->and($periods[0]['name'])->toBe('Period 2') // Most recent
        ->and($periods[1]['name'])->toBe('Period 3')
        ->and($periods[2]['name'])->toBe('Period 1'); // Oldest
});

test('getPeriodStats returns correct statistics for a period', function () {
    $user = User::factory()->create();
    $division = Division::factory()->create();
    $borrower = Borrower::factory()->create(['division_id' => $division->id]);
    $period = Period::factory()->create();
    
    // Create reports
    $reports = Report::factory()->count(5)->create([
        'period_id' => $period->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    // Create watchlist items
    Watchlist::factory()->count(2)->create([
        'report_id' => $reports->first()->id,
        'borrower_id' => $borrower->id,
        'added_by' => $user->id
    ]);
    
    $stats = invokePrivateMethod($this->service, 'getPeriodStats', [$period->id]);
    
    expect($stats)->toBeArray()
        ->and($stats)->toHaveKeys(['total_reports', 'total_watchlist', 'reports_by_division', 'watchlist_by_division'])
        ->and($stats['total_reports'])->toBe(5)
        ->and($stats['total_watchlist'])->toBe(2);
});

test('calculateComparison returns correct comparison metrics', function () {
    $user = User::factory()->create();
    $division = Division::factory()->create();
    $borrower = Borrower::factory()->create(['division_id' => $division->id]);
    
    $period1 = Period::factory()->create();
    $period2 = Period::factory()->create();
    
    // Period 1: 10 reports, 2 watchlist
    $reports1 = Report::factory()->count(10)->create([
        'period_id' => $period1->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    Watchlist::factory()->count(2)->create([
        'report_id' => $reports1->first()->id,
        'borrower_id' => $borrower->id,
        'added_by' => $user->id
    ]);
    
    // Period 2: 5 reports, 4 watchlist
    $reports2 = Report::factory()->count(5)->create([
        'period_id' => $period2->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    Watchlist::factory()->count(4)->create([
        'report_id' => $reports2->first()->id,
        'borrower_id' => $borrower->id,
        'added_by' => $user->id
    ]);
    
    $comparison = invokePrivateMethod($this->service, 'calculateComparison', [$period1->id, $period2->id]);
    
    expect($comparison)->toBeArray()
        ->and($comparison)->toHaveKeys(['reports_change', 'watchlist_change'])
        ->and($comparison['reports_change']['value'])->toEqual(100.0) // 10 vs 5 = 100% increase
        ->and($comparison['reports_change']['direction'])->toBe('up')
        ->and($comparison['watchlist_change']['value'])->toEqual(-50.0) // 2 vs 4 = 50% decrease
        ->and($comparison['watchlist_change']['direction'])->toBe('down');
});

test('getPeriodComparisonData returns complete comparison data', function () {
    $user = User::factory()->create();
    $division = Division::factory()->create();
    $borrower = Borrower::factory()->create(['division_id' => $division->id]);
    
    $period1 = Period::factory()->create();
    $period2 = Period::factory()->create();
    
    // Create some data
    Report::factory()->count(3)->create([
        'period_id' => $period1->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    Report::factory()->count(2)->create([
        'period_id' => $period2->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    $data = $this->service->getPeriodComparisonData($period1->id, $period2->id);
    
    expect($data)->toBeArray()
        ->and($data)->toHaveKeys(['period1', 'period2', 'comparison'])
        ->and($data['period1'])->toHaveKeys(['total_reports', 'total_watchlist'])
        ->and($data['period2'])->toHaveKeys(['total_reports', 'total_watchlist'])
        ->and($data['comparison'])->toHaveKeys(['reports_change', 'watchlist_change']);
});

test('percentage calculation handles empty datasets', function () {
    $result = invokePrivateMethod($this->service, 'calculatePercentageChange', [0, 0]);
    
    expect($result['value'])->toEqual(0)
        ->and($result['direction'])->toBe('neutral');
});

test('getReportsByPeriodAndDivision handles missing divisions', function () {
    $user = User::factory()->create();
    $division = Division::factory()->create(['code' => 'DIV1']);
    $borrower = Borrower::factory()->create(['division_id' => $division->id]);
    $period = Period::factory()->create();
    
    // Create reports only for DIV1
    Report::factory()->count(3)->create([
        'period_id' => $period->id,
        'borrower_id' => $borrower->id,
        'created_by' => $user->id
    ]);
    
    $result = invokePrivateMethod($this->service, 'getReportsByPeriodAndDivision', [$period->id]);
    
    expect($result)->toBeArray()
        ->and($result['DIV1'])->toBe(3);
});

// Helper function to invoke private methods for testing
function invokePrivateMethod($object, $methodName, array $parameters = [])
{
    $reflection = new \ReflectionClass(get_class($object));
    $method = $reflection->getMethod($methodName);
    $method->setAccessible(true);
    
    return $method->invokeArgs($object, $parameters);
}
