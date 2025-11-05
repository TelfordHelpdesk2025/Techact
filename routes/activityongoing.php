<?php

use App\Http\Controllers\General\OngoingController;
use Illuminate\Support\Facades\Route;

Route::get("/activity", [OngoingController::class, 'index'])->name('activity');
Route::post('/activity', [OngoingController::class, 'store']);
