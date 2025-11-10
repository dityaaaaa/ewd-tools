<?php

namespace Database\Seeders;

use App\Models\Borrower;
use App\Models\Division;
use Illuminate\Database\Seeder;

class BorrowerSeeder extends Seeder
{
    public function run(): void
    {
        $division = Division::query()->first();
        if (!$division) {
            $this->command?->warn('No divisions found. Run DivisionSeeder first.');
            return;
        }

        $names = [
            'PT Nusantara Sejahtera',
            'CV Maju Bersama',
            'UD Sumber Rejeki',
        ];

        foreach ($names as $name) {
            Borrower::firstOrCreate([
                'name' => $name,
                'division_id' => $division->id,
            ]);
        }
    }
}