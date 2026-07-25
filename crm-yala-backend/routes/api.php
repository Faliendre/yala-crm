<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaptacionController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\FollowupController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SuggestionController;
use Illuminate\Http\Request;

// 1. Rutas Públicas
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login-error', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');
Route::get('/test-db', function () {
    return response()->json([
        'default_connection' => config('database.default'),
        'connection_details' => config('database.connections.' . config('database.default')),
        'captaciones_count' => \App\Models\Captacion::count(),
        'users_count' => \App\Models\User::count(),
        'env_db_connection' => env('DB_CONNECTION'),
        'env_db_port' => env('DB_PORT'),
        'env_db_database' => env('DB_DATABASE'),
    ]);
});

// 2. Rutas Protegidas por Sanctum
Route::middleware(['auth:sanctum', 'last_seen'])->group(function () {
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/register-user', [AuthController::class, 'registerUser'])->middleware('role:admin');
    Route::get('/users', [AuthController::class, 'listUsers'])->middleware('role:admin');
    Route::put('/users/{id}', [AuthController::class, 'updateUser']);
    Route::delete('/users/{id}', [AuthController::class, 'deleteUser'])->middleware('role:admin');
    Route::put('/profile/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Captaciones / Prospectos
    Route::post('/captaciones/quick', [CaptacionController::class, 'quickStore']);
    Route::apiResource('captaciones', CaptacionController::class);

    // Visitas
    Route::apiResource('visits', VisitController::class)->except(['update', 'show']);

    // Seguimientos
    Route::apiResource('followups', FollowupController::class)->except(['show']);

    // Ventas
    Route::apiResource('sales', SaleController::class)->only(['index', 'store', 'destroy']);

    // Comisiones
    Route::get('/commissions', [CommissionController::class, 'index']);
    Route::get('/commissions/stats', [CommissionController::class, 'stats']);

    // Sugerencias
    Route::apiResource('suggestions', SuggestionController::class)->only(['index', 'store', 'destroy']);

    // Utilitarios
    Route::get('/sellers', function (Request $request) {
        return \App\Models\User::where('role', 'seller')->get(['id', 'username']);
    })->middleware('role:admin');
});
