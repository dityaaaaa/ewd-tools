<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User permissions
            'view user',
            'create user',
            'update user',
            'delete user',

            // Division permissions
            'view division',
            'create division',
            'update division',
            'delete division',

            // Borrower permissions
            'view borrower',
            'create borrower',
            'update borrower',
            'delete borrower',

            // Template permissions
            'view template',
            'create template',
            'update template',
            'delete template',

            // Aspect permissions
            'view aspect',
            'create aspect',
            'update aspect',
            'delete aspect',

            // Question permissions
            'view question',
            'create question',
            'update question',
            'delete question',

            // Period permissions
            'view period',
            'create period',
            'update period',
            'delete period',

            // Report permissions
            'view report',
            'create report',
            'update report',
            'delete report',
            'submit report',

            // Report Summary permissions
            'view report summary',
            'create report summary',
            'update report summary',
            'delete report summary',

            // Answer permissions
            'view answer',
            'create answer',
            'update answer',
            'delete answer',

            // Watchlist permissions
            'view watchlist',
            'create watchlist',
            'update watchlist',
            'delete watchlist',

            // Monitoring Note permissions
            'view monitoring note',
            'create monitoring note',
            'update monitoring note',
            'delete monitoring note',

            // Action Item permissions
            'view action item',
            'create action item',
            'update action item',
            'delete action item',

            // Visibility Rule permissions
            'view visibility rule',
            'create visibility rule',
            'update visibility rule',
            'delete visibility rule',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $admin = Role::create(['name' => 'admin']);
        $relationshipManager = Role::create(['name' => 'relationship_manager']);
        $riskAnalyst = Role::create(['name' => 'risk_analyst']);
        $kadeptBisnis = Role::create(['name' => 'kadept_bisnis']);
        $kadeptRisk = Role::create(['name' => 'kadept_risk']);

        // Admin mendapatkan semua permission
        $admin->givePermissionTo($permissions);

        // Relationship Manager
        $relationshipManager->givePermissionTo([
            'view borrower',
            'create borrower',
            'update borrower',
            
            'view report',
            'create report',
            'update report',
            'delete report',
            'submit report',
            
            'view report summary',
            'create report summary',
            'update report summary',
            
            'view answer',
            'create answer',
            'update answer',
            
            'view period',
            'view template',
            'view aspect',
            'view question',
        ]);

        // Risk Analyst
        $riskAnalyst->givePermissionTo([
            'view borrower',
            
            'view report',
            'update report',
            
            'view report summary',
            'update report summary',
            
            'view answer',
            'update answer',
            
            'view watchlist',
            'create watchlist',
            'update watchlist',
            
            'view monitoring note',
            'create monitoring note',
            'update monitoring note',
            
            'view action item',
            'create action item',
            'update action item',
            
            'view period',
            'view template',
            'view aspect',
            'view question',
        ]);

        // Kepala Departemen Bisnis
        $kadeptBisnis->givePermissionTo([
            'view borrower',
            
            'view report',
            'update report',
            
            'view report summary',
            
            'view answer',
            
            'view watchlist',
            
            'view monitoring note',
            
            'view action item',
            
            'view period',
            'view template',
            'view aspect',
            'view question',
            'view division',
            'view user',
        ]);

        // Kepala Departemen Risk
        $kadeptRisk->givePermissionTo([
            'view borrower',
            
            'view report',
            'update report',
            
            'view report summary',
            'update report summary',
            
            'view answer',
            
            'view watchlist',
            'create watchlist',
            'update watchlist',
            
            'view monitoring note',
            'create monitoring note',
            'update monitoring note',
            
            'view action item',
            'create action item',
            'update action item',
            
            'view period',
            'create period',
            'update period',
            
            'view template',
            'view aspect',
            'view question',
            'view division',
            'view user',
        ]);

        // User admin akan dibuat di UserSeeder, tidak perlu dibuat di sini
    }
}
