<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\DataTableService;
use Illuminate\Support\Facades\DB;

use function Symfony\Component\Clock\now;

class TechActivityController extends Controller
{
    protected $datatable;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }

    public function index(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'eeportal',
            'my_activity_list',
            [
                'conditions' => function ($query) {
                    return $query
                        ->whereIn('status', [
                            'Ongoing',
                            'On-Going',
                            'Complete',
                            'For Engineer Approval'
                        ])
                        ->where(function ($q) {
                            $q->where('item_status', '!=', 'Deleted')
                                ->orWhereNull('item_status');
                        })
                        ->orderBy('id', 'desc');
                },

                'searchColumns' => [
                    'emp_name',
                    'shift',
                    'my_activity',
                    'machine',
                    'log_time',
                    'time_out',
                    'status',
                    'note'
                ],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Tech/Activity', [
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


    public function deletedActivity(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'eeportal',
            'my_activity_list',
            [
                'conditions' => function ($query) {
                    return $query->where(function ($q) {
                        $q->where('item_status', 'Deleted');
                    })->orderBy('log_time', 'desc');
                },
                'searchColumns' => ['emp_name', 'shift', 'my_activity', 'machine', 'log_time', 'time_out', 'status', 'note'],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Tech/DeletedActivity', [
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

    public function deletedStatus(Request $request, $id)
    {
        DB::connection('eeportal')
            ->table('my_activity_list')
            ->where('id', $id)
            ->update([
                'item_status' => $request->item_status,
                'deleted_by' => session('emp_data')['emp_name'] ?? '',
                'deleted_date' => now()
            ]);

        return back()->with('success', 'Status updated!');
    }

    public function restoreStatus(Request $request, $id)
    {
        DB::connection('eeportal')
            ->table('my_activity_list')
            ->where('id', $id)
            ->update([
                'item_status' => $request->item_status,
                'restored_by' => session('emp_data')['emp_name'] ?? '',
                'restored_date' => now()
            ]);

        return back()->with('success', 'Status updated!');
    }
}
