<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            AdminSeeder::class,
            DivisionSeeder::class,
            UserSeeder::class,
            AspectSeeder::class,
            QuestionSeeder::class,
            QuestionOptionSeeder::class,
            TemplateSeeder::class,
            PeriodSeeder::class,
            BorrowerSeeder::class,
            BorrowerDetailSeeder::class,
            BorrowerFacilitySeeder::class,
            ReportSeeder::class,
            AnswerSeeder::class,
            MonitoringNoteSeeder::class,
            ApprovalSeeder::class,
        ]);
    }
}
