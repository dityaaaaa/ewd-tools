<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Division;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin dibuat oleh AdminSeeder; hindari duplikasi admin di sini

        $divisions = Division::all();

        foreach ($divisions as $division) {
            $divisionCode = strtolower($division->code);
            $divisionName = $division->name;

            $rm = User::factory()->create(
                [
                    'name' => "Relationship Manager {$divisionName}",
                    'email' => "rm.{$divisionCode}@bank.com",
                    'password' => Hash::make('password'),
                    'division_id' => $division->id,
                ]
            );
            $rmRole = \Spatie\Permission\Models\Role::where('name', 'relationship_manager')->first();
            $rm->assignRole('relationship_manager');
            $rm->update(['role_id' => $rmRole->id]);

            $riskAnalyst = User::factory()->create(
                [
                    'name' => "Risk Analyst {$divisionName}",
                    'email' => "risk.analyst.{$divisionCode}@bank.com",
                    'password' => Hash::make('password'),
                    'division_id' => $division->id,
                ]
            );
            $riskAnalystRole = \Spatie\Permission\Models\Role::where('name', 'risk_analyst')->first();
            $riskAnalyst->assignRole('risk_analyst');
            $riskAnalyst->update(['role_id' => $riskAnalystRole->id]);

            $kadeptBisnis = User::factory()->create(
                [
                    'name' => "Kepala Departemen Bisnis {$divisionName}",
                    'email' => "kadept.bisnis.{$divisionCode}@bank.com",
                    'password' => Hash::make('password'),
                    'division_id' => $division->id,
                ]
            );
            $kadeptBisnisRole = \Spatie\Permission\Models\Role::where('name', 'kadept_bisnis')->first();
            $kadeptBisnis->assignRole('kadept_bisnis');
            $kadeptBisnis->update(['role_id' => $kadeptBisnisRole->id]);

            $kadeptRisk = User::factory()->create(
                [
                    'email' => "kadept.risk.{$divisionCode}@bank.com",
                    'name' => "Kepala Departemen Risk {$divisionName}",
                    'password' => Hash::make('password'),
                    'division_id' => $division->id,
                ]
            );
            $kadeptRiskRole = \Spatie\Permission\Models\Role::where('name', 'kadept_risk')->first();
            $kadeptRisk->assignRole('kadept_risk');
            $kadeptRisk->update(['role_id' => $kadeptRiskRole->id]);
        }
    }
}