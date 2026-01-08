<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MyActivity;
use Illuminate\Support\Facades\DB;

class MyActivityController extends Controller
{
    public function index()
    {
        return MyActivity::orderBy('log_time', 'desc')->get();
    }

    public function store(Request $request)
    {
        $activity = DB::connection('eeportal')->table('my_activity_list')->insert([
            'emp_id' => $request->emp_id,
            'emp_name' => $request->emp_name,
            'shift' => $request->shift,
            'my_activity' => $request->my_activity,
            'machine' => $request->machine,
            'note' => $request->note,
            'status' => !in_array(strtoupper($request->machine), ['N/A', 'NA']) ? 'On Going' : 'For Approval',
            'log_time' => now()->toIso8601String(),
        ]);

        return response()->json($activity, 201);
    }
}
