<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OngoingController extends Controller
{
    protected $datatable;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }

    /**
     * Show list of ongoing activities
     */
    public function index(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'server26',
            'my_activity_list',
            [
                'searchColumns' => ['emp_name', 'Shift', 'my_activity', 'machine', 'log_time', 'status'],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result; // for CSV exporting
        }

        return Inertia::render('Activity/Activity', [
            'tableData' => $result['data'],
            'tableFilters' => $request->only([
                'search',
                'perPage',
                'sortBy',
                'sortDirection',
                'start',
                'end',
                'dropdownSearchValue',
                'dropdownFields',
            ]),
        ]);
    }

    /**
     * Show page for creating a new activity
     */
    public function index_addActivity(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'masterlist',
            'employee_masterlist',
            [
                'conditions' => function ($query) {
                    return $query
                        ->where('ACCSTATUS', 1)
                        ->whereNot('EMPLOYID', 0);
                },
                'searchColumns' => ['EMPNAME', 'EMPLOYID', 'JOB_TITLE', 'DEPARTMENT'],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Activity/NewActivity', [
            'tableData' => $result['data'],
            'tableFilters' => $request->only([
                'search',
                'perPage',
                'sortBy',
                'sortDirection',
                'start',
                'end',
                'dropdownSearchValue',
                'dropdownFields',
            ]),
        ]);
    }

    /**
     * Insert new activity log
     */
    public function addActivity(Request $request)
    {
        $request->validate([
            'emp_id' => 'required',
            'emp_name' => 'required',
            'Shift' => 'required',
            'my_activity' => 'required',
            'machine' => 'required',
            'note' => 'nullable|string',
        ]);

        $status = (strtoupper($request->machine) !== 'N/A' && strtoupper($request->machine) !== 'NA')
            ? 'On Going'
            : 'For Approval';

        DB::connection('server26')->table('my_activity_list')->insert([
            'emp_id' => $request->emp_id,
            'emp_name' => $request->emp_name,
            'Shift' => $request->Shift,
            'my_activity' => $request->my_activity,
            'machine' => $request->machine,
            'log_time' => Carbon::now(),
            'note' => $request->note,
            'status' => $status,
        ]);

        return back()->with('success', 'Activity logged successfully.');
    }

    /**
     * Remove activity
     */
    public function removeActivity(Request $request)
    {
        DB::connection('server26')->table('my_activity_list')
            ->where('emp_id', $request->input('emp_id'))
            ->delete();

        return back()->with('success', 'Activity removed successfully.');
    }

    /**
     * Change activity role (if needed later)
     */
    public function changeActivityRole(Request $request)
    {
        $id = $request->input('emp_id');
        $role = $request->input('role');

        DB::connection('server26')->table('my_activity_list')
            ->where('emp_id', $id)
            ->update([
                'emp_role' => $role,
            ]);

        return back()->with('success', 'Activity role changed successfully.');
    }
}
