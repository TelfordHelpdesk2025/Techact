<?php

namespace App\Http\Controllers\activityGeneral;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActivityController extends Controller
{
    protected $datatable;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }

    public function index(Request $request)
    {
        $empData = session('emp_data');

        $result = $this->datatable->handle(
            $request,
            'server26',
            'activity_list',
            [

                'searchColumns' => ['activity', 'description', 'created_by', 'date_created'],
                'defaultSort' => ['activity', 'desc'],
            ]
        );

        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Activity/activityList', [
            'tableData' => $result['data'],
            'empData' => $empData,
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

    public function getActivityData(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        if (!$start || !$end) {
            return response()->json(['error' => 'Missing date range'], 400);
        }

        $rows = DB::connection('authify')->table('my_activity_list')
            ->whereRaw("
            STR_TO_DATE(log_time, '%b/%d/%Y %H:%i:%s')
            BETWEEN STR_TO_DATE(?, '%Y-%m-%d')
            AND DATE_ADD(STR_TO_DATE(?, '%Y-%m-%d'), INTERVAL 1 DAY)
        ", [$start, $end])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($rows);
    }



    public function indexExport(Request $request)
    {
        return Inertia::render('Activity/QuarterlyExportTool', [
            'emp_data' => $request->session()->get('emp_data'),
        ]);
    }

    public function destroy($id)
    {
        DB::connection('server26')->table('activity_list')->where('id', $id)->delete();
        return back()->with('success', 'Activity deleted successfully!');
    }
}
