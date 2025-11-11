<?php

namespace Database\Seeders;

use App\Models\Borrower;
use App\Models\Division;
use Illuminate\Database\Seeder;

class BorrowerSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = Division::all();
        if ($divisions->isEmpty()) {
            $this->command?->warn('No divisions found. Run DivisionSeeder first.');
            return;
        }

        foreach ($divisions as $division) {
            // Buat minimal 12 debitur per divisi dengan penamaan unik
            for ($i = 1; $i <= 12; $i++) {
                Borrower::firstOrCreate([
                    'name' => sprintf('Debitur %s #%02d', $division->code, $i),
                    'division_id' => $division->id,
                ]);
            }
        }
    }
}