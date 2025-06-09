<?php

namespace App\Http\Controllers\v1;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Services\ReportService;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }
    
    public function indexReport()
    {
        return Inertia::render('admin/report/index', [

        ]);
    }

    public function salesReportPDF(Request $request)
    {
        try {
            $validated = $request->validate([
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            ]);

            $report = $this->reportService->getSalesReport(
                $validated['start_date'],
                $validated['end_date']
            );

            // Handle service-level errors
            if (isset($report['success']) && !$report['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $report['error'] ?? 'Failed to generate report',
                ], 400); // Bad Request
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            
        }
    }

    public function salesReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            ]);

            // Generate report
            $report = $this->reportService->getSalesReport(
                $validated['start_date'],
                $validated['end_date']
            );

            // Handle service-level errors
            if (isset($report['success']) && !$report['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $report['error'] ?? 'Failed to generate report',
                ], 400); // Bad Request
            }

            $pdf = Pdf::loadView('pdf.sales_report', [
                'report' => $report,
            ]);
        
            return $pdf->stream('sales-report.pdf');

            // return response()->json([
            //     'success' => true,
            //     'data' => $report,
            // ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422); // Validation error
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred.',
            ], 500); // Server error
        }
    }



    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
