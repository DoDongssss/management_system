<?php

namespace App\Http\Services;

use App\Models\Booking;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ReportService
{

    public function getSalesReport($startDate = null, $endDate = null)
    {
        try {
            // Validate dates if provided
            if ($startDate && $endDate) {
                $startDate = Carbon::parse($startDate)->startOfDay();
                $endDate = Carbon::parse($endDate)->endOfDay();
                
                if ($startDate > $endDate) {
                    throw new \InvalidArgumentException("End date must be after start date");
                }
            }

            $query = Booking::query()
                ->with(['room', 'tenant'])
                ->where('status', 'completed');

            // Filter by date range - check_in should be within the report period
            if ($startDate && $endDate) {
                $query->whereBetween('check_in', [$startDate, $endDate]);
            }

            // Get all matching bookings
            $bookings = $query->get();

            // Calculate metrics
            $totalSales = $bookings->sum('total_amount');
            $averageSale = $bookings->avg('total_amount');
            $bookingCount = $bookings->count();

            return [
                'success' => true,
                'start_date' => $startDate?->toDateString(),
                'end_date' => $endDate?->toDateString(),
                'total_sales' => number_format($totalSales, 2),
                'average_sale' => number_format($averageSale, 2),
                'booking_count' => $bookingCount,
                'bookings' => $bookings,
                'metrics' => [
                    'total_sales_raw' => $totalSales, // For calculations
                    'average_sale_raw' => $averageSale,
                ]
            ];

        } catch (\InvalidArgumentException $e) {
            // Handle date validation errors
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_type' => 'validation'
            ];
        } catch (\Exception $e) {
            // Handle unexpected errors
            Log::error('Sales report generation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);
            
            return [
                'success' => false,
                'error' => 'Failed to generate sales report',
                'error_type' => 'system'
            ];
        }
    }
}
