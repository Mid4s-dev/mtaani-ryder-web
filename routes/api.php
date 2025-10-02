<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\RiderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('send-otp', [AuthController::class, 'sendOtp']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Public business information endpoints removed - now admin-only system

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::put('auth/profile', [AuthController::class, 'updateProfile']);

    // Delivery routes
    Route::prefix('deliveries')->group(function () {
        Route::post('/', [DeliveryController::class, 'create']);
        Route::get('/', [DeliveryController::class, 'getUserDeliveries']);
        Route::get('available', [DeliveryController::class, 'getAvailableDeliveries']);
        Route::get('available-for-rider', [DeliveryController::class, 'getAvailableDeliveriesForRider']);
        Route::get('customer-rider-history', [DeliveryController::class, 'getCustomerRiderHistory']);
        Route::get('available-riders', [DeliveryController::class, 'getAvailableRiders']);
        Route::get('{id}', [DeliveryController::class, 'show']);
        Route::post('{id}/accept', [DeliveryController::class, 'acceptDelivery']);
        Route::post('{id}/reject', [DeliveryController::class, 'rejectDelivery']);
        Route::post('{id}/select-riders', [DeliveryController::class, 'selectRiders']);
        Route::put('{id}/status', [DeliveryController::class, 'updateStatus']);
        Route::post('{id}/rate', [DeliveryController::class, 'rateDelivery']);
        Route::get('{id}/tracking', [DeliveryController::class, 'getTracking']);
    });

    // Rider routes
    Route::prefix('rider')->group(function () {
        Route::put('profile', [RiderController::class, 'completeProfile']);
        Route::put('online-status', [RiderController::class, 'updateOnlineStatus']);
        Route::put('location', [RiderController::class, 'updateLocation']);
        Route::get('dashboard', [RiderController::class, 'getDashboard']);
        Route::get('earnings', [RiderController::class, 'getEarnings']);
    });

    // Business routes removed - now admin-only system

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'getDashboard']);
        Route::get('transactions', [AdminController::class, 'getLiveTransactions']);
        Route::get('users', [AdminController::class, 'getUserManagement']);
        Route::get('users/{userId}', [AdminController::class, 'getUserDetails']);
        Route::put('users/{userId}/verification', [AdminController::class, 'updateUserVerification']);
        Route::put('users/{userId}/status', [AdminController::class, 'updateUserStatus']);
        Route::get('analytics', [AdminController::class, 'getAnalytics']);
    });

    // Debug routes
    Route::get('riders/nearby', [RiderController::class, 'getNearbyRiders']);
});