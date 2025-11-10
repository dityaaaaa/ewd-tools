<?php

namespace Database\Seeders;

use App\Models\Borrower;
use App\Models\BorrowerFacility;
use Illuminate\Database\Seeder;

class BorrowerFacilitySeeder extends Seeder
{
    public function run(): void
    {
        $borrowers = Borrower::all();
        if ($borrowers->isEmpty()) {
            $this->command?->warn('No borrowers found. Run DivisionSeeder and BorrowerSeeder first.');
            return;
        }

        foreach ($borrowers as $borrower) {
            // Create between 2-4 facilities per borrower if none
            if ($borrower->facilities()->count() > 0) {
                continue;
            }
            $count = random_int(2, 4);
            BorrowerFacility::factory()->count($count)->create([
                'borrower_id' => $borrower->id,
            ]);
        }

        $this->command?->info('BorrowerFacility seeded for all borrowers.');
    }
}