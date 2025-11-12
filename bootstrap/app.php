<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // $middleware->alias([
        //     'permission' => CheckPermission::class,
        // ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Render a friendly Server Error page for unexpected exceptions
        $exceptions->render(function (Request $request) {
            // Preserve JSON responses and local debug screens
            if ($request->expectsJson() || app()->isLocal()) {
                return null;
            }

            return Inertia::render('errors/server-error')
                ->toResponse($request)
                ->setStatusCode(500);
        });
    })->create();
