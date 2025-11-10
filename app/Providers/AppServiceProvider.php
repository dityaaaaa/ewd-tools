<?php

namespace App\Providers;

use App\Models\Approval;
use App\Models\Report;
use App\Policies\ApprovalPolicy;
use App\Policies\ReportPolicy;
use App\Models\ReportSummary;
use App\Observers\ApprovalObserver;
use App\Observers\SummaryObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
        ReportSummary::observe(SummaryObserver::class);
        Approval::observe(ApprovalObserver::class);

        // Register policies
        Gate::policy(Report::class, ReportPolicy::class);
        Gate::policy(Approval::class, ApprovalPolicy::class);
    }
}
