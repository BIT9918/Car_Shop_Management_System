<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarControllerController;
use App\Http\Controllers\CarHistoryController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (no auth required)
|--------------------------------------------------------------------------
*/

// Auth — login & register are outside middleware
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (auth:sanctum middleware)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me',      [AuthController::class, 'me']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('cars',         [CarControllerController::class, 'index']);
    Route::get('cars/{id}',    [CarControllerController::class, 'GetCarByID']);
    Route::post('cars',        [CarControllerController::class, 'store']);
    Route::put('cars/{id}',    [CarControllerController::class, 'update']);
    Route::delete('cars/{id}', [CarControllerController::class, 'destory']);

    Route::get('car-history',  [CarHistoryController::class, 'index']);
    Route::get('orders',       [OrderController::class, 'index']);
    
    Route::post('orders',      [CarControllerController::class, 'purchase']);
});
