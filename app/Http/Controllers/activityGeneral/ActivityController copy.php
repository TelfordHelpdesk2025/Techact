<?php

namespace App\Http\Controllers\activityGeneral;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActivityController extends Controller
{
    protected $datatable;
    protected $datatable1;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }


    public function index(Request $request)
    {

        $empData = session('emp_data');


        $result = $this->datatable->handle(
            $request,
            'eeportal',
            'activity_list',
            [
                'searchColumns' => ['activity', 'description', 'created_by', 'date_created'],
                'defaultSort'   => ['id', 'desc'],
            ]
        );



        // FOR CSV EXPORTING
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



    public function store(Request $request)
    {

        // dd($request->all());
        $checkIfExists = DB::connection('eeportal')->table('activity_list')
            ->where('activity', $request->input('activity'))
            ->exists();

        if (!$checkIfExists) {
            DB::connection('eeportal')->table('activity_list')
                ->insert([
                    'activity' => $request->input('activity'),
                    'description' => $request->input('description'),
                    'created_by' => session('emp_data')['emp_name'],
                ]);
        }

        return back()->with('success', 'Activity added successfully.');
    }



    public function update(Request $request, $id)
    {
        $request->validate([
            'activity' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        DB::connection('eeportal')->table('activity_list')
            ->where('id', $id)
            ->update([
                'activity' => $request->activity,
                'description' => $request->description,
                'updated_by' => session('emp_data')['emp_name'] ?? 'Unknown',
            ]);

        return back()->with('success', 'Activity updated successfully!');
    }

    public function destroy($id)
    {
        DB::connection('eeportal')->table('activity_list')->where('id', $id)->delete();
        return back()->with('success', 'Activity deleted successfully!');
    }

    // ActivityController.php
    public function getQuarterData(Request $request)
    {
        $quarter = $request->input('quarter');
        $year = $request->input('year');
        [$start, $end] = $this->getQuarterBounds($quarter, $year);

        $rows = DB::connection('eeportal')->table('my_activity_list')
            ->whereBetween('date_created', [$start, $end])
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

    private function getQuarterBounds($quarter, $year)
    {
        switch ((int)$quarter) {
            case 1:
                return ["{$year}-11-03", date('Y-m-d', strtotime("{$year}-02-02 +1 year"))];
            case 2:
                return ["{$year}-02-03", "{$year}-05-02"];
            case 3:
                return ["{$year}-05-03", "{$year}-08-02"];
            case 4:
                return ["{$year}-08-03", "{$year}-11-02"];
            default:
                return [null, null];
        }
    }
}
