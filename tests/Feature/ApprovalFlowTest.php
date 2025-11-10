<?php

use App\Enums\ApprovalLevel;
use App\Enums\ApprovalStatus as ApprovalStatusEnum;
use App\Enums\ReportStatus;
use App\Models\Approval;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    Artisan::call('db:seed', ['--class' => Database\Seeders\RolePermissionSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\DivisionSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\UserSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\TemplateSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\BorrowerSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\PeriodSeeder::class]);
    Artisan::call('db:seed', ['--class' => Database\Seeders\ReportSeeder::class]);
});

test('sequential approvals by correct roles progress report to DONE', function () {
    $report = Report::first();
    expect($report)->not->toBeNull();

    // Risk Analyst (ERO) approves first
    $riskAnalyst = User::query()->role('risk_analyst')->first();
    expect($riskAnalyst)->not->toBeNull();
    $approvalERO = Approval::where('report_id', $report->id)
        ->where('level', ApprovalLevel::ERO->value)
        ->first();
    actingAs($riskAnalyst);
    post(route('approvals.approve', $approvalERO), [
        'notes' => 'Reviewed by risk analyst',
        'final_classification' => 1,
        'override_reason' => 'Based on updated risk assessment',
    ])->assertRedirect()->assertSessionHas('success');

    $report->refresh();
    expect($report->status)->toBe(ReportStatus::REVIEWED);
    assertDatabaseHas('approvals', ['id' => $approvalERO->id, 'status' => ApprovalStatusEnum::APPROVED->value]);

    // Kadept Bisnis approves next
    $kadeptBisnis = User::query()->role('kadept_bisnis')->first();
    expect($kadeptBisnis)->not->toBeNull();
    $approvalKadept = Approval::where('report_id', $report->id)
        ->where('level', ApprovalLevel::KADEPT_BISNIS->value)
        ->first();
    actingAs($kadeptBisnis);
    post(route('approvals.approve', $approvalKadept), [
        'notes' => 'Approved by kadept bisnis',
    ])->assertRedirect()->assertSessionHas('success');

    $report->refresh();
    expect($report->status)->toBe(ReportStatus::APPROVED);
    assertDatabaseHas('approvals', ['id' => $approvalKadept->id, 'status' => ApprovalStatusEnum::APPROVED->value]);

    // Kadiv ERO approves finally
    $kadeptRisk = User::query()->role('kadept_risk')->first();
    expect($kadeptRisk)->not->toBeNull();
    $approvalKadiv = Approval::where('report_id', $report->id)
        ->where('level', ApprovalLevel::KADIV_ERO->value)
        ->first();
    actingAs($kadeptRisk);
    post(route('approvals.approve', $approvalKadiv), [
        'notes' => 'Approved by kadiv ERO',
    ])->assertRedirect()->assertSessionHas('success');

    $report->refresh();
    expect($report->status)->toBe(ReportStatus::DONE);
    assertDatabaseHas('approvals', ['id' => $approvalKadiv->id, 'status' => ApprovalStatusEnum::APPROVED->value]);
});