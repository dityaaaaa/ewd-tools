<?php

namespace Database\Seeders;

use App\Enums\FacilityType;
use App\Models\Borrower;
use App\Models\BorrowerDetail;
use Illuminate\Database\Seeder;

class BorrowerDetailSeeder extends Seeder
{
    public function run(): void
    {
        $borrowers = Borrower::all();
        if ($borrowers->isEmpty()) {
            $this->command?->warn('No borrowers found. Run DivisionSeeder and BorrowerSeeder first.');
            return;
        }

        foreach ($borrowers as $borrower) {
            if ($borrower->detail) {
                continue;
            }

            $detail = BorrowerDetail::factory()->make();
            $detail->borrower_id = $borrower->id;
            // Ensure valid enum value for purpose
            if (! $detail->purpose) {
                $detail->purpose = FacilityType::KMKE->value ?? FacilityType::cases()[0]->value;
            }
            $detail->save();
        }

        $this->command?->info('BorrowerDetail seeded for all borrowers.');
    }
}