<?php

namespace App\Http\Controllers\v1;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Services\BookingService;
use App\Http\Services\RoomService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class BookingController extends Controller
{

    protected $roomService, $bookingService;

    public function __construct(RoomService $roomService, BookingService $bookingService)
    {
        $this->roomService = $roomService;
        $this->bookingService = $bookingService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $search = $request->get('search');
            $status = $request->get('status') ?? 'all';

            return Inertia::render('admin/booking/index', [
                'rooms' => $this->roomService->getActiveRoomsWithBookingStatus($search
                ,$status),
                'filters' => compact('search', 'status'),
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching rooms: " . $e->getMessage());

            return Inertia::render('admin/room/index', [
                'rooms' => [],
                'filters' => $request->only(['search', 'status']),
                'error' => 'Failed to fetch rooms. Please try again.',
            ]);
        }
    }

    public function updateBookingStatus(Request $request, $id): RedirectResponse
    {
        // dd($id);
        try {
            $this->bookingService->updateStatus($id, 'completed');

            return redirect()->route('booking.index')->with('success', 'Booking created successfully!');
        } catch (Exception $e) {
            Log::error("Error creating booking: " . $e->getMessage());

            return redirect()->route('booking.index')->with('error', 'Failed to create booking.');
        }
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
