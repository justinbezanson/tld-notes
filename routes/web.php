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
    Route::inertia('goals', 'Goals')->name('goals');
});

require __DIR__.'/settings.php';
