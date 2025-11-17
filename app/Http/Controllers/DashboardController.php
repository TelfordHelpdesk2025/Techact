<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $empData = session('emp_data');
        $empName = $empData['emp_name'] ?? null;

        // ✅ Use selected date if provided, else today
        $selectedDate = $request->input('date');
        $date = $selectedDate ? Carbon::parse($selectedDate) : Carbon::now();

        $dayStart = $date->copy()->startOfDay()->format('Y-m-d H:i:s');
        $dayEnd   = $date->copy()->endOfDay()->format('Y-m-d H:i:s');

        // 🔹 Total counts technician
        $totalActivities = DB::connection('server26')->table('my_activity_list')
            ->where('emp_name', $empName)
            ->count();

        $completedActivities = DB::connection('server26')->table('my_activity_list')
            ->where('emp_name', $empName)
            ->where('status', 'complete')
            ->count();

        $ongoingActivities = DB::connection('server26')->table('my_activity_list')
            ->where('emp_name', $empName)
            ->whereIn('status', ['ongoing', 'on going'])
            ->count();

        // 🔹 Total counts admin
        $totalActivitiesAdmin = DB::connection('server26')->table('my_activity_list')->count();
        $completedActivitiesAdmin = DB::connection('server26')->table('my_activity_list')->where('status', 'complete')->count();
        $ongoingActivitiesAdmin = DB::connection('server26')->table('my_activity_list')->whereIn('status', ['ongoing', 'on going'])->count();

        // 🔹 Today's total counts
        $totalActivitiesTodayAdmin = DB::connection('server26')->table('my_activity_list')
            ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
            ->count();

        // $totalApprovalAdmin = DB::connection('server26')->table('my_activity_list')
        //     ->where('status', 'For Engineer Approval')
        //     ->count();

        $totalActivitiesToday = DB::connection('server26')->table('my_activity_list')
            ->where('emp_name', $empName)
            ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
            ->count();

        $myActivitiesToday = DB::connection('server26')->table('my_activity_list')
            ->where('emp_name', $empName)
            ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
            ->pluck('my_activity');

        // 🔹 Technician bar chart
        $todayStatuses = ['complete', 'ongoing', 'on going'];
        $datasets = [];
        $statusColors = [
            'complete' => '#34D399', // green
            'ongoing' => '#60A5FA',  // blue
            'on going' => '#FBBF24', // yellow
        ];

        foreach ($todayStatuses as $status) {
            $data = [];
            foreach ($myActivitiesToday as $activity) {
                $duration = DB::connection('server26')->table('my_activity_list')
                    ->selectRaw("SUM(TIME_TO_SEC(TIMEDIFF(STR_TO_DATE(time_out, '%b/%d/%Y %H:%i:%s'), STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s')))/3600) AS total_hours")
                    ->where('emp_name', $empName)
                    ->where('status', $status)
                    ->where('my_activity', $activity)
                    ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
                    ->value('total_hours');
                $data[] = $duration ? round($duration, 2) : 0;
            }
            $datasets[] = [
                'label' => ucfirst($status),
                'data' => $data,
                'backgroundColor' => $statusColors[$status] ?? '#A78BFA',
            ];
        }

        $barChartData = [
            'labels' => $myActivitiesToday,
            'datasets' => $datasets,
        ];

        // 🔹 Admin bar chart
        $myActivitiesTodayAdmin = DB::connection('server26')->table('my_activity_list')
            ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
            ->pluck('emp_name')
            ->unique()
            ->values()
            ->toArray();

        $datasetsAdminPerTechnician = [];
        $activitiesList = DB::connection('server26')->table('my_activity_list')
            ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
            ->pluck('my_activity')
            ->unique()
            ->values()
            ->toArray();

        $rawData = DB::connection('server26')->table('my_activity_list')
            ->select('emp_name', 'my_activity', DB::raw("SUM(TIMESTAMPDIFF(MINUTE, STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s'), STR_TO_DATE(time_out, '%b/%d/%Y %H:%i:%s'))) AS total_minutes"))
            ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
            ->groupBy('emp_name', 'my_activity')
            ->get();

        $randomColor = fn() => sprintf('#%06X', mt_rand(0, 0xFFFFFF));

        foreach ($activitiesList as $activity) {
            $datasetsAdminPerTechnician[] = [
                'label' => $activity,
                'backgroundColor' => $randomColor(),
                'data' => array_map(function ($tech) use ($rawData, $activity) {
                    $match = $rawData->firstWhere(fn($r) => $r->emp_name === $tech && $r->my_activity === $activity);
                    return $match ? round($match->total_minutes / 60, 2) : 0;
                }, $myActivitiesTodayAdmin),
            ];
        }

        $barChartDataAdmin = [
            'labels' => $myActivitiesTodayAdmin,
            'datasets' => [
                [
                    'label' => 'Completed',
                    'data' => array_map(fn($emp) => DB::connection('server26')->table('my_activity_list')
                        ->where('emp_name', $emp)->where('status', 'complete')
                        ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
                        ->count(), $myActivitiesTodayAdmin),
                    'backgroundColor' => '#34D399',
                ],
                [
                    'label' => 'Ongoing',
                    'data' => array_map(fn($emp) => DB::connection('server26')->table('my_activity_list')
                        ->where('emp_name', $emp)->where('status', 'ongoing')
                        ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
                        ->count(), $myActivitiesTodayAdmin),
                    'backgroundColor' => '#60A5FA',
                ],
            ],
        ];

        $barChartDataAdminPerTechnician = [
            'labels' => $myActivitiesTodayAdmin,
            'datasets' => $datasetsAdminPerTechnician,
        ];

        // 🔹 Ranking
        $ranking = DB::connection('server26')
            ->table('my_activity_list')
            ->select(
                'emp_name',
                DB::raw("DATE(STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s')) AS activity_date"),
                DB::raw("CAST(AVG(TIMESTAMPDIFF(MINUTE, STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s'), STR_TO_DATE(time_out, '%b/%d/%Y %H:%i:%s'))) AS DECIMAL(10,2)) AS avg_completion_minutes"),
                DB::raw("MIN(STR_TO_DATE(time_out, '%b/%d/%Y %H:%i:%s')) AS earliest_completion_time"),
                DB::raw("COUNT(my_activity) AS total_completed")
            )
            ->whereRaw("LOWER(status) LIKE 'complete%'")
            ->whereRaw("STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s') BETWEEN ? AND ?", [$dayStart, $dayEnd])
            ->groupBy('emp_name', DB::raw("DATE(STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s'))"))
            ->orderByDesc('total_completed')
            ->orderBy(DB::raw('avg_completion_minutes + 0'), 'asc')
            ->orderBy('earliest_completion_time', 'asc')
            ->get()
            ->values()
            ->map(function ($row, $index) {
                $row->rank = $index + 1;
                return $row;
            });

        return Inertia::render('Dashboard', [
            'emp_data' => $empData,
            'totalActivities' => $totalActivities,
            'completedActivities' => $completedActivities,
            'ongoingActivities' => $ongoingActivities,
            'totalActivitiesAdmin' => $totalActivitiesAdmin,
            'completedActivitiesAdmin' => $completedActivitiesAdmin,
            'ongoingActivitiesAdmin' => $ongoingActivitiesAdmin,
            'totalActivitiesTodayAdmin' => $totalActivitiesTodayAdmin,
            // 'totalApprovalAdmin' => $totalApprovalAdmin,
            'totalActivitiesToday' => $totalActivitiesToday,
            'barChartData' => $barChartData,
            'barChartDataAdmin' => $barChartDataAdmin,
            'barChartDataAdminPerTechnician' => $barChartDataAdminPerTechnician,
            'ranked' => $ranking,
            'selectedDate' => $date->format('Y-m-d'),
        ]);
    }
}
