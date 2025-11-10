<?php

namespace Database\Seeders;

use App\Models\Period;
use App\Models\User;
use App\Enums\PeriodStatus;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil admin user sebagai creator (tanpa mengandalkan email tertentu)
        $admin = User::query()->role('admin')->first();
        
        if (!$admin) {
            $this->command->error('Admin user tidak ditemukan. Pastikan RolePermissionSeeder dan Admin/UserSeeder sudah dijalankan.');
            return;
        }

        $periods = [
            [
                'name' => 'Kuartal I 2025',
                'start_date' => Carbon::create(2025, 1, 1)->startOfDay(),
                'end_date' => Carbon::create(2025, 3, 31)->endOfDay(),
                'status' => PeriodStatus::ENDED,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Kuartal II 2025',
                'start_date' => Carbon::create(2025, 4, 1)->startOfDay(),
                'end_date' => Carbon::create(2025, 6, 30)->endOfDay(),
                'status' => PeriodStatus::ENDED,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Kuartal III 2025',
                'start_date' => Carbon::create(2025, 7, 1)->startOfDay(),
                'end_date' => Carbon::create(2025, 9, 30)->endOfDay(),
                'status' => PeriodStatus::ENDED,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Kuartal IV 2025',
                'start_date' => Carbon::create(2025, 10, 1)->startOfDay(),
                'end_date' => Carbon::create(2025, 12, 31)->endOfDay(),
                'status' => PeriodStatus::DRAFT,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($periods as $period) {
            Period::firstOrCreate(
                ['name' => $period['name']],
                $period
            );
        }

        $this->command->info('4 periode kuartal 2025 berhasil dibuat.');
    }
}