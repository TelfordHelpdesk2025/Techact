<?php

namespace App\Http\Controllers;

use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OngoingActivityController extends Controller
{
    protected $datatable;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }

    public function index(Request $request)
    {
        // Default sort kung walang laman request
        if (!$request->has('sortBy')) {
            $request->merge(['sortBy' => 'id']);
        }
        if (!$request->has('sortDirection')) {
            $request->merge(['sortDirection' => 'desc']);
        }

        $empId = session('emp_data')['emp_id'] ?? '';



        // Handle datatable query na may filters
        // ✅ Handle datatable query na may filters
        $result = $this->datatable->handle(
            $request,
            'server26', // Connection name (must stay as string)
            'my_activity_list', // Table name
            [
                'defaultSortBy' => 'emp_id',
                'defaultSortDirection' => 'desc',
                'dateColumn' => 'log_time',
                'searchColumns' => ['emp_id', 'emp_name', 'my_activity', 'status'],

                'conditions' => function ($query) use ($request, $empId) {
                    // 🔹 Filter by employee
                    if (!empty($empId)) {
                        $query->where('emp_id', $empId);
                    }

                    // 🔹 Limit sa ongoing-related statuses
                    $query->where(function ($q) {
                        $q->where('status', 'like', 'Ongoing%')
                            ->orWhere('status', 'like', 'On-Going%')
                            ->orWhere('status', 'like', 'For Engineer Approval%');
                    });

                    // 🔹 Dropdown search (multiple fields)
                    if ($request->filled('dropdownSearchValue') && $request->filled('dropdownFields')) {
                        $value = $request->input('dropdownSearchValue');
                        $fields = array_map('trim', explode(',', $request->input('dropdownFields')));

                        $query->where(function ($q) use ($fields, $value) {
                            foreach ($fields as $field) {
                                $q->orWhere($field, 'like', "%{$value}%");
                            }
                        });
                    }

                    return $query;
                },

                'filename' => 'activity_export',
                'exportColumns' => [
                    'emp_id',
                    'emp_name',
                    'shift',
                    'my_activity',
                    'machine',
                    'log_time',
                    'time_out',
                    'duration',
                    'status',
                    'note',
                ],
            ]
        );


        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        // ✅ Get activity options from database
        $activityOptions = DB::connection('server26')->table('activity_list')
            ->pluck('activity')
            ->toArray();

        $machineOptions = DB::connection('server25')->table('machine_list')
            ->whereNotNull('machine_num')       // exclude NULL
            ->where('machine_num', '!=', '')    // exclude empty string
            ->orderBy('platform', 'desc') // order by machine_num
            ->pluck('machine_num')
            ->toArray();


        // dd($activityOptions);

        return Inertia::render('Tech/Ongoing', [
            'tableData' => $result['data'],
            'activityOptions' => $activityOptions, // Pass to frontend
            'machineOptions' => $machineOptions, // Pass to frontend
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
            'empData' => [
                'emp_id' => session('emp_data')['emp_id'] ?? null,
                'emp_name' => session('emp_data')['emp_name'] ?? null,
            ]
        ]);
    }

    // public function addActivity(Request $request)
    // {
    //     $request->validate([
    //         'emp_id' => 'required|string',
    //         'emp_name' => 'required|string',
    //         'shift' => 'required|string',
    //         'my_activity' => 'required|string',
    //         'machine' => 'required|string',
    //         'note' => 'nullable|string',
    //     ]);

    //     // status depende sa machine
    //     $status = (!in_array(strtoupper($request->machine), ['N/A', 'NA']))
    //         ? 'On Going'
    //         : 'For Approval';

    //     DB::table('my_activity_list')->insert([
    //         'emp_id'      => $request->emp_id,
    //         'emp_name'    => $request->emp_name,
    //         'shift'       => $request->shift,
    //         'my_activity' => $request->my_activity,
    //         'machine'     => $request->machine,
    //         'log_time'    => Carbon::now(),
    //         'note'        => $request->note,
    //         'status'      => $status,
    //     ]);

    //     return back()->with('success', 'Activity logged successfully.');
    // }

    public function addActivity(Request $request)
    {
        try {
            $request->validate([
                'emp_id'      => 'required|string',
                'emp_name'    => 'required|string',
                'shift'       => 'required|string',
                'my_activity' => 'required|string',
                'machine'     => 'required|string',
                'note'        => 'nullable|string',
                'status'      => 'required|string',
            ]);

            DB::connection('server26')->table('my_activity_list')->insert([
                'emp_id'      => $request->emp_id,
                'emp_name'    => $request->emp_name,
                'shift'       => $request->shift,
                'my_activity' => $request->my_activity,
                'machine'     => $request->machine,
                'log_time' => \Carbon\Carbon::now()->format('M/d/Y H:i:s'),
                'note'        => $request->note,
                'status'      => $request->status, // Use status from the form
            ]);

            // Redirect to ongoing activity page with success message
            return redirect()->route('tech.ongoing')->with('success', 'Activity logged successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to log activity. Please try again.');
        }
    }

    /**
     * Update an activity
     */
    public function updateActivity(Request $request, $id)
    {
        $request->validate([
            'time_out'    => 'required|string',
            'my_activity' => 'required|string',
            'machine'     => 'required|string',
            'note'        => 'nullable|string',
            'status'      => 'nullable|string',
        ]);

        $status = trim($request->status);

        // auto adjust
        switch ($status) {
            case "Ongoing":
                $status = "Complete";
                break;
            case "On-Going":
                $status = "For Engineer Approval";
                break;
            case "For Engineer Approval":
                $status = "Ongoing"; // 🔄 cycle balik
                break;
        }

        // ✅ parse any human-readable date/time
        $timeOut = \Carbon\Carbon::parse($request->time_out)->format('M/d/Y H:i:s');

        DB::connection('server26')->table('my_activity_list')
            ->where('id', $id)
            ->update([
                'time_out'    => $timeOut,
                'my_activity'  => $request->my_activity,
                'machine'      => $request->machine,
                'note'         => $request->note,
                'status'       => $status,
                'date_updated' => now(),
            ]);

        return back()->with('success', 'Activity updated successfully.');
    }

    // public function forApproval(Request $request)
    // {
    //     // Default sort kung walang laman request
    //     if (!$request->has('sortBy')) {
    //         $request->merge(['sortBy' => 'id']);
    //     }
    //     if (!$request->has('sortDirection')) {
    //         $request->merge(['sortDirection' => 'desc']);
    //     }

    //     $empId = session('emp_data')['emp_id'] ?? '';

    //     // Handle datatable query na may filters
    //     $result = $this->datatable->handle(
    //         $request,
    //         'mysql', // connection
    //         'my_activity_list', // table
    //         [
    //             'defaultSortBy' => 'emp_id',
    //             'defaultSortDirection' => 'desc',
    //             'dateColumn' => 'log_time',
    //             'searchColumns' => ['emp_id', 'emp_name', 'my_activity', 'status'],
    //             'conditions' => function ($query) use ($request) {


    //                 // Limit lang sa Ongoing-related activities
    //                 $query->where(function ($q) {
    //                     $q->where('status', 'like', 'for engineer approval%');
    //                 });

    //                 // Search using dropdown
    //                 if ($request->filled('dropdownSearchValue') && $request->filled('dropdownFields')) {
    //                     $value = $request->input('dropdownSearchValue');
    //                     $fields = explode(',', $request->input('dropdownFields')); // comma-separated

    //                     $query->where(function ($q) use ($fields, $value) {
    //                         foreach ($fields as $field) {
    //                             $q->orWhere($field, 'like', "%$value%");
    //                         }
    //                     });
    //                 }

    //                 return $query;
    //             },
    //             'filename' => 'activity_export',
    //             'exportColumns' => [
    //                 'emp_id',
    //                 'emp_name',
    //                 'shift',
    //                 'my_activity',
    //                 'machine',
    //                 'log_time',
    //                 'time_out',
    //                 'duration',
    //                 'status',
    //                 'note'
    //             ],
    //         ]
    //     );

    //     if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
    //         return $result;
    //     }

    //     // ✅ Get activity options from database
    //     $activityOptions = DB::table('activity_list')
    //         ->pluck('activity')
    //         ->toArray();

    //     $machineOptions = DB::table('machine_list')
    //         ->whereNotNull('machine_num')       // exclude NULL
    //         ->where('machine_num', '!=', '')    // exclude empty string
    //         ->orderBy('machine_platform', 'asc') // order by machine_num
    //         ->pluck('machine_num')
    //         ->toArray();


    //     // dd($activityOptions);

    //     return Inertia::render('Tech/forApproval', [
    //         'tableData' => $result['data'],
    //         'activityOptions' => $activityOptions, // Pass to frontend
    //         'machineOptions' => $machineOptions, // Pass to frontend
    //         'tableFilters' => $request->only([
    //             'search',
    //             'perPage',
    //             'sortBy',
    //             'sortDirection',
    //             'start',
    //             'end',
    //             'dropdownSearchValue',
    //             'dropdownFields',
    //         ]),
    //         'empData' => [
    //             'emp_id' => session('emp_data')['emp_id'] ?? null,
    //             'emp_name' => session('emp_data')['emp_name'] ?? null,
    //         ]
    //     ]);
    // }

    public function forApproval(Request $request)
    {
        // Default sort kung walang laman request
        if (!$request->has('sortBy')) {
            $request->merge(['sortBy' => 'id']);
        }
        if (!$request->has('sortDirection')) {
            $request->merge(['sortDirection' => 'desc']);
        }

        $empId = session('emp_data')['emp_id'] ?? '';

        // Handle datatable query na may filters
        $result = $this->datatable->handle(
            $request,
            'server26', // connection
            'my_activity_list', // table
            [
                'defaultSortBy' => 'emp_id',
                'defaultSortDirection' => 'desc',
                'dateColumn' => 'log_time',
                'searchColumns' => ['emp_id', 'emp_name', 'my_activity', 'status'],
                'conditions' => function ($query) use ($request) {
                    // Limit lang sa Ongoing-related activities
                    $query->where(function ($q) {
                        $q->where('status', 'like', 'for engineer approval%');
                    });

                    // Search using dropdown
                    if ($request->filled('dropdownSearchValue') && $request->filled('dropdownFields')) {
                        $value = $request->input('dropdownSearchValue');
                        $fields = explode(',', $request->input('dropdownFields')); // comma-separated

                        $query->where(function ($q) use ($fields, $value) {
                            foreach ($fields as $field) {
                                $q->orWhere($field, 'like', "%$value%");
                            }
                        });
                    }

                    return $query;
                },
                'filename' => 'activity_export',
                'exportColumns' => [
                    'emp_id',
                    'emp_name',
                    'shift',
                    'my_activity',
                    'machine',
                    'log_time',
                    'time_out',
                    'duration',
                    'status',
                    'note'
                ],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        // ✅ Get activity options from database
        $activityOptions = DB::connection('server26')->table('activity_list')
            ->pluck('activity')
            ->toArray();

        $machineOptions = DB::connection('server25')->table('machine_list')
            ->whereNotNull('machine_num')
            ->where('machine_num', '!=', '')
            ->orderBy('machine_platform', 'asc')
            ->pluck('machine_num')
            ->toArray();

        // ✅ Count kung ilan yung "For Engineer Approval"
        $forApprovalCount = DB::connection('server26')->table('my_activity_list')
            ->where('status', 'like', 'for engineer approval%')
            ->count();

        // dd($forApprovalCount);

        return Inertia::render('Tech/forApproval', [
            'tableData' => $result['data'],
            'activityOptions' => $activityOptions,
            'machineOptions' => $machineOptions,
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
            'empData' => [
                'emp_id' => session('emp_data')['emp_id'] ?? null,
                'emp_name' => session('emp_data')['emp_name'] ?? null,
            ],
            'forApprovalCount' => $forApprovalCount // 👉 pass to frontend
        ]);
    }


    public function forApprovalActivity(Request $request, $id)
    {
        $request->validate([
            'approver_id'   => 'required|string',
            'approver_name' => 'required|string',
            'approve_date'  => 'required|string',
            'my_activity'   => 'required|string',
            'machine'       => 'required|string',
            'note'          => 'nullable|string',
            'remarks'       => 'nullable|string',
            'status'        => 'nullable|string',
        ]);

        $status = trim($request->status);

        switch ($status) {
            case "Ongoing":
                $status = "Complete";
                break;
            case "On-Going":
                $status = "For Engineer Approval";
                break;
            case "For Engineer Approval":
                $status = "Ongoing"; // 🔄 cycle balik
                break;
        }

        DB::connection('server26')->table('my_activity_list')
            ->where('id', $id)
            ->update([
                'approver_id'   => $request->approver_id,
                'approver_name' => $request->approver_name,
                'approve_date'  => $request->approve_date,
                'my_activity'   => $request->my_activity,
                'machine'       => $request->machine,
                'note'          => $request->note,
                'remarks'   => $request->remarks,
                'status'        => $status,
                'date_updated'  => now(),
            ]);

        return back()->with('success', 'Approved Activity successfully.');
    }

    public function doneActivities(Request $request)
    {
        // Default sort kung walang laman request
        if (!$request->has('sortBy')) {
            $request->merge(['sortBy' => 'id']);
        }
        if (!$request->has('sortDirection')) {
            $request->merge(['sortDirection' => 'desc']);
        }

        $empId = session('emp_data')['emp_id'] ?? '';

        // Handle datatable query na may filters
        $result = $this->datatable->handle(
            $request,
            'server26', // connection
            'my_activity_list', // table
            [
                'defaultSortBy' => 'emp_id',
                'defaultSortDirection' => 'desc',
                'dateColumn' => 'log_time',
                'searchColumns' => ['emp_id', 'emp_name', 'my_activity', 'status'],
                'conditions' => function ($query) use ($request, $empId) {
                    if ($empId) {
                        $query->where('emp_id', $empId);
                    }


                    // Limit lang sa Ongoing-related activities
                    $query->where(function ($q) {
                        $q->where('status', 'like', 'Complete%')
                            ->orWhere('status', 'like', 'Reject%');
                    });

                    // Search using dropdown
                    if ($request->filled('dropdownSearchValue') && $request->filled('dropdownFields')) {
                        $value = $request->input('dropdownSearchValue');
                        $fields = explode(',', $request->input('dropdownFields')); // comma-separated

                        $query->where(function ($q) use ($fields, $value) {
                            foreach ($fields as $field) {
                                $q->orWhere($field, 'like', "%$value%");
                            }
                        });
                    }
                    return $query;
                },
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Tech/doneActivities', [
            'tableData' => $result['data'], // Pass to frontend
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
            'empData' => [
                'emp_id' => session('emp_data')['emp_id'] ?? null,
                'emp_name' => session('emp_data')['emp_name'] ?? null,
            ]
        ]);
    }

    public function reject(Request $request, $id)
    {
        DB::connection('server26')->table('my_activity_list')
            ->where('id', $id)
            ->update([
                'rejector_id'   => $request->rejector_id,
                'rejector_name' => $request->rejector_name,
                'rejected_date' => $request->rejected_date,
                'remarks'       => $request->remarks,
                'status'        => 'Rejected',
                // 'time_out'      => Carbon::now()->format('M/d/Y H:i:s'), // → Nov/17/2025 15:13:49
            ]);

        return back()->with('success', 'Activity rejected successfully');
    }
}
