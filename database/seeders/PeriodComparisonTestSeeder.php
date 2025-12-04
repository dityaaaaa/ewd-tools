<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Division;
use App\Models\Borrower;
use App\Models\Period;
use App\Models\Report;
use App\Models\Watchlist;
use App\Models\Template;
use App\Enums\PeriodStatus;
use App\Enums\ReportStatus;
use App\Enums\WatchlistStatus;
use Carbon\Carbon;

class PeriodComparisonTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding Period Comparison Test Data...');

        // Create admin user if not exists
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin Test',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        $this->command->info('✓ Admin user created/verified');

        // Create divisions
        $divisions = [
            ['code' => 'DIV1', 'name' => 'Divisi Komersial 1'],
            ['code' => 'DIV2', 'name' => 'Divisi Komersial 2'],
            ['code' => 'DIV3', 'name' => 'Divisi Konsumer'],
            ['code' => 'DIV4', 'name' => 'Divisi Mikro'],
        ];

        $divisionModels = [];
        foreach ($divisions as $divData) {
            $divisionModels[] = Division::firstOrCreate(
                ['code' => $divData['code']],
                ['name' => $divData['name']]
            );
        }

        $this->command->info('✓ Created ' . count($divisionModels) . ' divisions');

        // Create template if not exists
        $template = Template::first();
        if (!$template) {
            $template = Template::create([]);
            $this->command->info('✓ Created template');
        }

        // Create 3 periods for comparison
        $periods = [
            [
                'name' => 'Q1 2024 (Jan-Mar)',
                'start_date' => Carbon::create(2024, 1, 1),
                'end_date' => Carbon::create(2024, 3, 31),
                'status' => PeriodStatus::EXPIRED->value,
            ],
            [
                'name' => 'Q2 2024 (Apr-Jun)',
                'start_date' => Carbon::create(2024, 4, 1),
                'end_date' => Carbon::create(2024, 6, 30),
                'status' => PeriodStatus::EXPIRED->value,
            ],
            [
                'name' => 'Q3 2024 (Jul-Sep)',
                'start_date' => Carbon::create(2024, 7, 1),
                'end_date' => Carbon::create(2024, 9, 30),
                'status' => PeriodStatus::ACTIVE->value,
            ],
        ];

        $periodModels = [];
        foreach ($periods as $periodData) {
            $periodModels[] = Period::firstOrCreate(
                ['name' => $periodData['name']],
                [
                    'start_date' => $periodData['start_date'],
                    'end_date' => $periodData['end_date'],
                    'status' => $periodData['status'],
                    'created_by' => $admin->id,
                ]
            );
        }

        $this->command->info('✓ Created ' . count($periodModels) . ' periods');

        // Create borrowers for each division
        $borrowersPerDivision = 5;
        $allBorrowers = [];

        foreach ($divisionModels as $division) {
            for ($i = 1; $i <= $borrowersPerDivision; $i++) {
                $borrower = Borrower::firstOrCreate(
                    [
                        'name' => "PT {$division->code} Borrower {$i}",
                        'division_id' => $division->id,
                    ]
                );
                $allBorrowers[] = $borrower;
            }
        }

        $this->command->info('✓ Created ' . count($allBorrowers) . ' borrowers');

        // Create reports for each period with varying amounts
        $reportCounts = [
            0 => 15, // Q1: 15 reports
            1 => 22, // Q2: 22 reports (increase)
            2 => 28, // Q3: 28 reports (increase)
        ];

        $watchlistCounts = [
            0 => 3,  // Q1: 3 watchlist
            1 => 5,  // Q2: 5 watchlist (increase)
            2 => 4,  // Q3: 4 watchlist (decrease)
        ];

        $totalReports = 0;
        $totalWatchlists = 0;

        foreach ($periodModels as $index => $period) {
            $reportsToCreate = $reportCounts[$index];
            $watchlistsToCreate = $watchlistCounts[$index];

            // Distribute reports across divisions
            $reportsPerDivision = [];
            foreach ($divisionModels as $divIndex => $division) {
                // Vary the distribution: DIV1 gets more, DIV4 gets less
                $multiplier = match ($divIndex) {
                    0 => 0.35, // DIV1: 35%
                    1 => 0.30, // DIV2: 30%
                    2 => 0.20, // DIV3: 20%
                    3 => 0.15, // DIV4: 15%
                    default => 0.25,
                };
                $reportsPerDivision[$division->id] = (int) ($reportsToCreate * $multiplier);
            }

            // Create reports
            $createdReports = [];
            foreach ($reportsPerDivision as $divisionId => $count) {
                $divisionBorrowers = array_filter($allBorrowers, fn($b) => $b->division_id === $divisionId);
                
                for ($i = 0; $i < $count; $i++) {
                    $borrower = $divisionBorrowers[array_rand($divisionBorrowers)];
                    
                    $report = Report::create([
                        'borrower_id' => $borrower->id,
                        'period_id' => $period->id,
                        'template_id' => $template->id,
                        'created_by' => $admin->id,
                        'status' => ReportStatus::SUBMITTED->value,
                        'submitted_at' => $period->start_date->addDays(rand(1, 30)),
                    ]);
                    
                    $createdReports[] = $report;
                    $totalReports++;
                }
            }

            // Create watchlists for some reports
            $reportsForWatchlist = array_slice($createdReports, 0, $watchlistsToCreate);
            foreach ($reportsForWatchlist as $report) {
                Watchlist::create([
                    'borrower_id' => $report->borrower_id,
                    'report_id' => $report->id,
                    'status' => WatchlistStatus::ACTIVE->value,
                    'added_by' => $admin->id,
                ]);
                $totalWatchlists++;
            }

            $this->command->info("✓ Period '{$period->name}': {$reportsToCreate} reports, {$watchlistsToCreate} watchlists");
        }

        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info("   Total Reports: {$totalReports}");
        $this->command->info("   Total Watchlists: {$totalWatchlists}");
        $this->command->info('');
        $this->command->info('✅ Period Comparison Test Data seeded successfully!');
        $this->command->info('');
        $this->command->info('📝 Test the feature:');
        $this->command->info('   1. Login as: admin@test.com / password');
        $this->command->info('   2. Go to Dashboard');
        $this->command->info('   3. Select periods to compare (e.g., Q1 2024 vs Q2 2024)');
        $this->command->info('   4. View comparison stats and charts');
    }
}
