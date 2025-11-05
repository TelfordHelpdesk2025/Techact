<?php

use App\Http\Controllers\activityGeneral\ActivityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\General\OngoingController;
use App\Http\Controllers\OngoingActivityController;
use App\Http\Controllers\TechActivityController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$app_name = env('APP_NAME', '');

// Authentication routes
require __DIR__ . '/auth.php';

// General routes
require __DIR__ . '/general.php';
require __DIR__ . '/activity.php';

Route::prefix($app_name)
    ->middleware(AuthMiddleware::class)
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    });

Route::get("/demo", [DemoController::class, 'index'])->name('demo');

Route::get('/techact/tech-activity', [TechActivityController::class, 'index'])->name('tech.activity');

Route::get('/techact/ongoing-activity', [OngoingActivityController::class, 'index'])->name('tech.ongoing');

Route::get('/techact/doneActivity', [OngoingActivityController::class, 'doneActivities'])->name('tech.doneActivities');

// ADD route
Route::post('/techact/ongoing/add', [OngoingActivityController::class, 'addActivity'])->name('ongoing.add');

// UPDATE route (new)
Route::put('/techact/ongoing/update/{id}', [OngoingActivityController::class, 'updateActivity'])->name('ongoing.update');

Route::get('/techact/activity', [OngoingController::class, 'index'])->name('activity');

Route::get('/techact/forApproval', [OngoingActivityController::class, 'forApproval'])->name('tech.forApproval');

Route::put('/techact/forApproval/approve/{id}', [OngoingActivityController::class, 'forApprovalActivity'])->name('ongoing.approve');

// Route::get('/techact', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/activity/list', [ActivityController::class, 'index'])->name('activity.list');

Route::post('/activity/add', [ActivityController::class, 'store'])->name('add.activity.list');
Route::put('/activity/update/{id}', [ActivityController::class, 'update'])->name('update.activity.list');
Route::delete('/activity/delete/{id}', [ActivityController::class, 'destroy'])->name('delete.activity.list');
// routes/api.php

Route::get('/export-activities', [ActivityController::class, 'indexExport'])
    ->name('export.activities');

Route::get('/api/export-activities', [ActivityController::class, 'getQuarterData'])
    ->name('api.export.activities');


// fallback
Route::fallback(function () {
    // For Inertia requests, just redirect back to the same URL
    return redirect()->to(request()->fullUrl());
})->name('404');
