<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Para sa vite prefetch
        Vite::prefetch(concurrency: 3);

        // Para sa Inertia shared props
        Inertia::share([
            'forApprovalCount' => function () {
                return DB::table('my_activity_list')
                    ->where('status', 'like', 'for engineer approval%')
                    ->count();
            },
        ]);
    }
}
