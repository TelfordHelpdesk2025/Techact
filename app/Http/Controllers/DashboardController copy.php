<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{

    public function index(Request $request)
    {
        // ✅ bilang ng lahat ng activities (lahat ng empleyado)
        $totalActivities = DB::table('my_activity_list')->count();

        // ✅ bilang ng Complete (lahat)
        $completeCount = DB::table('my_activity_list')
            ->where('status', 'Complete')
            ->count();

        // ✅ bilang ng Ongoing (lahat)
        $ongoingCount = DB::table('my_activity_list')
            ->whereIn('status', ['Ongoing', 'On Going'])
            ->count();

        // ✅ bilang ng Approved (lahat ng Complete na may opt_name hindi null)
        $approvedCount = DB::table('my_activity_list')
            ->where('status', 'Complete')
            ->whereNotNull('opt_name')
            ->count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total'    => $totalActivities,
                'complete' => $completeCount,
                'ongoing'  => $ongoingCount,
                'approved' => $approvedCount,
            ],
        ]);
    }

    public function dashboards()
    {
        $empId   = session('emp_data')['emp_id'] ?? null;
        $empName = session('emp_data')['emp_name'] ?? null;

        if (!$empName) {
            return redirect()->route('login'); // fallback
        }

        $stats = [
            'total' => DB::table('my_activity_list')
                ->where('emp_name', $empName)
                ->count(),

            'complete' => DB::table('my_activity_list')
                ->where('status', 'Complete')
                ->where('emp_name', $empName)
                ->count(),

            'ongoing' => DB::table('my_activity_list')
                ->whereIn('status', ['Ongoing', 'On Going'])
                ->where('emp_name', $empName)
                ->count(),
        ];

        return Inertia::render('Dashboards', [
            'stats'   => $stats,
            'empData' => [
                'emp_id'   => $empId,
                'emp_name' => $empName,
            ],
        ]);
    }
}
