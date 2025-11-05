<?php

use App\Http\Controllers\General\OngoingController;
use App\Http\Controllers\General\ProfileController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

$app_name = env('APP_NAME', '');

Route::redirect('/', "/$app_name");

Route::prefix($app_name)->middleware(AuthMiddleware::class)->group(function () {

  Route::middleware(AdminMiddleware::class)->group(function () {
    Route::get("/activity", [OngoingController::class, 'index'])->name('activity');
    Route::get("/new-activity", [OngoingController::class, 'index_addActivity'])->name('index_addActivity');
    Route::post("/add-activity", [OngoingController::class, 'addActivity'])->name('addActivity');
    Route::post("/remove-activity", [OngoingController::class, 'removeActivity'])->name('removeActivity');
    Route::patch("/change-activity-role", [OngoingController::class, 'changeActivityRole'])->name('changeActivityRole');
  });

  // Route::get("/", [DashboardController::class, 'index'])->name('dashboard');
  Route::get("/profile", [ProfileController::class, 'index'])->name('profile.index');
  Route::post("/change-password", [ProfileController::class, 'changePassword'])->name('changePassword');
});
