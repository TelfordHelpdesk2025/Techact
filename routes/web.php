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

Route::get('/techact/tech-activity-deleted', [TechActivityController::class, 'deletedActivity'])->name('tech.activity.deleted');

Route::put('/activity/{id}/deleted-status', [TechActivityController::class, 'deletedStatus'])
    ->name('activity.deleted-status');

Route::put('/activity/{id}/restore-status', [TechActivityController::class, 'restoreStatus'])
    ->name('activity.restore-status');


Route::get('/techact/ongoing-activity', [OngoingActivityController::class, 'index'])->name('tech.ongoing');

Route::get('/techact/doneActivity', [OngoingActivityController::class, 'doneActivities'])->name('tech.doneActivities');

// ADD route
Route::post('/techact/ongoing/add', [OngoingActivityController::class, 'addActivity'])->name('ongoing.add');

// UPDATE route (new)
Route::put('/techact/ongoing/update/{id}', [OngoingActivityController::class, 'updateActivity'])->name('ongoing.update');

Route::get('/techact/activity', [OngoingController::class, 'index'])->name('activity');

Route::get('/techact/forApproval', [OngoingActivityController::class, 'forApproval'])->name('tech.forApproval');

Route::put('/techact/forApproval/approve/{id}', [OngoingActivityController::class, 'forApprovalActivity'])->name('ongoing.approve');

Route::put('/techact/forApproval/reject/{id}', [OngoingActivityController::class, 'reject']);


// Route::get('/techact', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/activity/list', [ActivityController::class, 'index'])->name('activity.list');

Route::post('/activity/add', [ActivityController::class, 'store'])->name('add.activity.list');
Route::put('/activity/update/{id}', [ActivityController::class, 'update'])->name('update.activity.list');
Route::delete('/activity/delete/{id}', [ActivityController::class, 'destroy'])->name('delete.activity.list');
// routes/api.php

Route::get('/export-activities', [ActivityController::class, 'indexExport'])
    ->name('export.activities');

// Route::get('/api/export-activities', [ActivityController::class, 'getQuarterData'])
//     ->name('api.export.activities');

// web.php
Route::get('/activity/export', [ActivityController::class, 'indexExport'])
    ->name('activity.export');

// api.php
Route::get('/export/activities', [ActivityController::class, 'getActivityData'])
    ->name('api.export.activities');

Route::get('/tech/forApproval/mass', [OngoingActivityController::class, 'massApproval'])
    ->name('tech.forApproval.mass');

Route::put('/tech/forApproval/mass/approve', [OngoingActivityController::class, 'bulkApprove']);



// fallback
Route::fallback(function () {
    // For Inertia requests, just redirect back to the same URL
    return redirect()->to(request()->fullUrl());
})->name('404');
