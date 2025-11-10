<?php

use App\Http\Controllers\WatchlistController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::prefix('watchlist')->group(function () {
        Route::get('/', [WatchlistController::class, 'show'])->name('watchlist.show');
        Route::put('{monitoringNote}', [WatchlistController::class, 'update'])->name('watchlist.update');
        Route::post('{monitoringNote}/submit', [WatchlistController::class, 'submit'])->name('watchlist.submit');
    });

    Route::prefix('action-items')->group(function () {
        Route::post('{monitoringNote}', [WatchlistController::class, 'storeActionItem'])->name('action-items.store');
        Route::put('{actionItem}', [WatchlistController::class, 'updateActionItem'])->name('action-items.update');
        Route::delete('{actionItem}', [WatchlistController::class, 'deleteActionItem'])->name('action-items.destroy');
    });
});