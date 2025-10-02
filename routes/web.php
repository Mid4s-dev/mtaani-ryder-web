<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\RiderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('home');

// Protected routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Delivery routes - using enhanced components
    Route::prefix('deliveries')->name('deliveries.')->group(function () {
        Route::get('/', [DeliveryController::class, 'index'])->name('index');
        Route::get('create', function () {
            return Inertia::render('deliveries/CreateEnhanced');
        })->name('create');
        Route::get('{id}', [DeliveryController::class, 'show'])->name('show');
    });
    
    // Rider routes - using enhanced dashboard
    Route::prefix('rider')->name('rider.')->middleware('rider')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('rider/DashboardEnhanced');
        })->name('dashboard');
        Route::get('/profile', [RiderController::class, 'profile'])->name('profile');
    });
    
    // Admin routes - using enhanced admin dashboard
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('admin/DashboardEnhanced');
        })->name('dashboard');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
