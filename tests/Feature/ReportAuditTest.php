<?php

use App\Models\Report;
use App\Models\ReportAudit;
use App\Models\User;
use App\Services\ReportCalculationService;
use Illuminate\Support\Facades\Auth;

/**
 * Feature tests to verify audit creation and readable messages
 * during recalculation and approval flows.
 */

it('creates readable audit message on recalculation', function () {
    // Seed baseline data
    $this->seed([
        \Database\Seeders\RolePermissionSeeder::class,
        \Database\Seeders\DivisionSeeder::class,
        \Database\Seeders\UserSeeder::class,
        \Database\Seeders\TemplateSeeder::class,
        \Database\Seeders\BorrowerSeeder::class,
        \Database\Seeders\PeriodSeeder::class,
        \Database\Seeders\ReportSeeder::class,
    ]);

    // Act as a known user to attribute audit actor
    $actor = User::first();
    $this->actingAs($actor);

    $report = Report::query()->first();
    expect($report)->not()->toBeNull();

    // Trigger recalculation which should create an audit entry
    app(ReportCalculationService::class)->calculateAndStoreSummary($report);

    // Fetch latest audit for the report
    $audit = ReportAudit::query()
        ->where('report_id', $report->id)
        ->latest('id')
        ->first();

    expect($audit)->not()->toBeNull();
    expect($audit->action)->toBe('recalculated');
    // Ensure readable message contains expected phrase (system may author)
    expect($audit->readable_message)->toContain('menghitung ulang');
});

it('creates readable audit messages for sequential approvals', function () {
    // Seed baseline data
    $this->seed([
        \Database\Seeders\RolePermissionSeeder::class,
        \Database\Seeders\DivisionSeeder::class,
        \Database\Seeders\UserSeeder::class,
        \Database\Seeders\TemplateSeeder::class,
        \Database\Seeders\BorrowerSeeder::class,
        \Database\Seeders\PeriodSeeder::class,
        \Database\Seeders\ReportSeeder::class,
    ]);

    $report = Report::query()->first();
    expect($report)->not()->toBeNull();

    // Approvals follow the same sequence as ApprovalFlowTest
    // 1) Risk Analyst (ERO) approves
    $riskAnalyst = User::query()->role('risk_analyst')->first();
    expect($riskAnalyst)->not()->toBeNull();
    $approvalERO = \App\Models\Approval::where('report_id', $report->id)
        ->where('level', \App\Enums\ApprovalLevel::ERO->value)
        ->first();
    $this->actingAs($riskAnalyst);
    $this->post(route('approvals.approve', $approvalERO), [
        'notes' => 'Reviewed by risk analyst',
        'final_classification' => 1,
        'override_reason' => 'Based on updated risk assessment',
    ])->assertRedirect();

    // 2) Kadept Bisnis approves
    $kadept = User::query()->role('kadept_bisnis')->first();
    expect($kadept)->not()->toBeNull();
    $approvalKadept = \App\Models\Approval::where('report_id', $report->id)
        ->where('level', \App\Enums\ApprovalLevel::KADEPT_BISNIS->value)
        ->first();
    $this->actingAs($kadept);
    $this->post(route('approvals.approve', $approvalKadept), [
        'notes' => 'Approved by kadept bisnis',
    ])->assertRedirect();

    // 3) Kadiv ERO approves
    $kadiv = User::query()->role('kadept_risk')->first();
    expect($kadiv)->not()->toBeNull();
    $approvalKadiv = \App\Models\Approval::where('report_id', $report->id)
        ->where('level', \App\Enums\ApprovalLevel::KADIV_ERO->value)
        ->first();
    $this->actingAs($kadiv);
    $this->post(route('approvals.approve', $approvalKadiv), [
        'notes' => 'Approved by kadiv ERO',
    ])->assertRedirect();

    // Verify audits exist with readable messages mentioning approval
    $audits = ReportAudit::query()
        ->where('report_id', $report->id)
        ->where('action', 'approved')
        ->get();

    expect($audits->count())->toBeGreaterThanOrEqual(3);
    foreach ($audits as $audit) {
        expect($audit->readable_message)->toContain('menyetujui laporan');
        expect($audit->readable_message)->not()->toBe('');
    }
});