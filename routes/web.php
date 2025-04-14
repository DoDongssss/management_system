<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\v1\RoomController;
use App\Http\Controllers\v1\AmenityController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // ROOM ROUTES
    Route::get('room', [RoomController::class, 'index'])->name('room.index');
    Route::post('room', [RoomController::class, 'store'])->name('room.store');
    Route::post('room/{id}', [RoomController::class, 'update'])->name('room.update'); 
    Route::delete('room/{id}', [RoomController::class, 'destroy'])->name('room.destroy');

    // AMENITY ROUTES
    Route::get('amenity', [AmenityController::class, 'index'])->name('amenity.index');
    Route::post('amenity', [AmenityController::class, 'store'])->name('amenity.store');
    Route::post('amenity/{id}', [AmenityController::class, 'update'])->name('amenity.update'); 
    Route::delete('amenity/{id}', [AmenityController::class, 'destroy'])->name('amenity.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
