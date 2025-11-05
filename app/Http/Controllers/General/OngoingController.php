<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OngoingController extends Controller
{
    /**
     * Show list of ongoing activities
     */
    public function index()
    {
        // Diretso kuha ng lahat ng data
        $activities = DB::table('my_activity_list')
            ->orderByDesc('log_time')
            ->get();

        return Inertia::render('Activity/Activity', [
            'activities' => $activities,
        ]);
    }

    /**
     * Insert new activity log
     */
    public function addActivity(Request $request)
    {
        $request->validate([
            'emp_id' => 'required|string',
            'emp_name' => 'required|string',
            'shift' => 'required|string',
            'my_activity' => 'required|string',
            'machine' => 'required|string',
            'note' => 'nullable|string',
        ]);

        // status depende sa machine
        $status = (!in_array(strtoupper($request->machine), ['N/A', 'NA']))
            ? 'On Going'
            : 'For Approval';

        DB::table('my_activity_list')->insert([
            'emp_id'      => $request->emp_id,
            'emp_name'    => $request->emp_name,
            'shift'       => $request->shift,
            'my_activity' => $request->my_activity,
            'machine'     => $request->machine,
            'log_time'    => Carbon::now(),
            'note'        => $request->note,
            'status'      => $status,
        ]);

        return back()->with('success', 'Activity logged successfully.');
    }

    /**
     * Update an activity
     */
    public function updateActivity(Request $request, $id)
    {
        $request->validate([
            'my_activity' => 'required|string',
            'machine'     => 'required|string',
            'note'        => 'nullable|string',
        ]);

        DB::table('my_activity_list')
            ->where('id', $id)
            ->update([
                'my_activity' => $request->my_activity,
                'machine'     => $request->machine,
                'note'        => $request->note,
                'status'      => (!in_array(strtoupper($request->machine), ['N/A', 'NA']))
                    ? 'On Going'
                    : 'For Approval',
                'updated_at'  => Carbon::now(),
            ]);

        return back()->with('success', 'Activity updated successfully.');
    }

    /**
     * Remove activity
     */
    public function removeActivity($id)
    {
        DB::table('my_activity_list')
            ->where('id', $id)
            ->delete();

        return back()->with('success', 'Activity removed successfully.');
    }
}
