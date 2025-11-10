<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            ['code' => 'DBS', 'name' => 'Divisi Bisnis Satu'],
            ['code' => 'DBD', 'name' => 'Divisi Bisnis Dua'],
            ['code' => 'DBT', 'name' => 'Divisi Bisnis Tiga'],
            ['code' => 'DBE', 'name' => 'Divisi Bisnis Empat'],
            ['code' => 'KWS', 'name' => 'Kantor Wilayah Satu'],
            ['code' => 'KWD', 'name' => 'Kantor Wilayah Dua'],
            ['code' => 'KWT', 'name' => 'Kantor Wilayah Tiga'],
            ['code' => 'MDN', 'name' => 'Medan Area'],
            ['code' => 'IPA', 'name' => 'IEBPA'],
        ];

        foreach ($divisions as $division) {
            Division::create($division);
        }
    }
}