<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/**
 * Routes public
 */

// Autentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Produk — READ ONLY boleh tanpa token
Route::get('/products',           [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Kategori — READ ONLY boleh tanpa token
Route::get('/categories',            [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

/**
 * Routes protected
 */
Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Produk — WRITE butuh token
    Route::post('/products',             [ProductController::class, 'store']);
    Route::put('/products/{product}',    [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Kategori — WRITE butuh token
    Route::post('/categories',              [CategoryController::class, 'store']);
    Route::put('/categories/{category}',    [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

});
