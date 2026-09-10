<?php

use App\Http\Controllers\RunController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    return view('landing', [
        'user' => $request->user(),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [RunController::class, 'index'])->name('dashboard');
    Route::post('runs', [RunController::class, 'store'])->name('runs.store');
    Route::put('runs/{run}', [RunController::class, 'update'])->name('runs.update');
    Route::delete('runs/{run}', [RunController::class, 'destroy'])->name('runs.destroy');
    Route::get('runs/{run}', [RunController::class, 'show'])->name('runs.show');
    Route::inertia('goals', 'Goals')->name('goals');
});

require __DIR__.'/settings.php';
