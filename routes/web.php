<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\AspectController;
use App\Http\Controllers\BorrowerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('periods/{period}/start', [PeriodController::class, 'start'])->name('periods.start');
    Route::post('periods/{period}/stop', [PeriodController::class, 'stop'])->name('periods.stop');

    Route::get('forms', [FormController::class, 'index'])->name('forms.index');
    Route::post('forms', [FormController::class, 'store'])->name('forms.store');
    Route::post('forms/save-step', [FormController::class, 'saveStepData'])->name('forms.saveStep');
    Route::get('summary/{report}', [SummaryController::class, 'show'])->name('summary.show');
    Route::put('summary/{report}', [SummaryController::class, 'update'])->name('summary.update');
});

Route::resource('divisions', DivisionController::class)
    ->middleware(['auth'])
    ->names('divisions');

Route::resource('users', UserController::class)
    ->middleware(['auth'])
    ->names('users');

Route::resource('borrowers', BorrowerController::class)
    ->middleware(['auth'])
    ->names('borrowers');

Route::resource('aspects', AspectController::class)
    ->middleware(['auth'])
    ->names('aspects');

Route::resource('templates', TemplateController::class)
    ->middleware(['auth'])
    ->names('templates');

Route::resource('periods', PeriodController::class)
    ->middleware(['auth'])
    ->names('periods');

Route::resource('reports', ReportController::class)
    ->middleware(['auth'])
    ->names('reports');

Route::get('reports/{report}/export-pdf', [ReportController::class, 'exportPdf'])
    ->middleware(['auth'])
    ->name('reports.exportPdf');

Route::get('reports/export-excel', [ReportController::class, 'exportExcel'])
    ->middleware(['auth'])
    ->name('reports.exportExcel');

Route::get('reports/{report}/export-excel', [ReportController::class, 'exportExcelDetail'])
    ->middleware(['auth'])
    ->name('reports.exportExcelDetail');

Route::get('reports/{report}/export-pdf-download', [ReportController::class, 'exportPdfDownload'])
    ->middleware(['auth'])
    ->name('reports.exportPdfDownload');

Route::get('approvals', [ApprovalController::class, 'index'])
    ->middleware(['auth'])
    ->name('approvals.index');

Route::post('approvals/{approval}/approve', [ApprovalController::class, 'approve'])
    ->middleware(['auth'])
    ->name('approvals.approve');

Route::post('approvals/{approval}/reject', [ApprovalController::class, 'reject'])
    ->middleware(['auth'])
    ->name('approvals.reject');

Route::get('admin/audits', [AuditController::class, 'index'])
    ->middleware(['auth'])
    ->name('audits.index');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/watchlist.php';

// Fallback 404 route to render a friendly Not Found page
Route::fallback(function () {
    return Inertia::render('errors/not-found')
        ->toResponse(request())
        ->setStatusCode(404);
});
