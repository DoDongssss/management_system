<?php

namespace App\Http\Services;

use Carbon\Carbon;
use App\Models\Tenant;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BookingService
{
    protected Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get all bookings with optional search and status filter.
     *
     * @param string|null $search
     * @param string $status
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|array
     */
    public function getAllBookings(?string $search = null, string $status = 'all')
    {
        try {
            return $this->booking
                ->with(['room', 'tenant'])
                ->when(in_array($status, ['void', 'completed', 'active']), function ($q) use ($status) {
                    $q->where('status', $status);
                })
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($query) use ($search) {
                        $query->whereHas('room', function ($roomQuery) use ($search) {
                            $roomQuery->where('room_number', 'LIKE', "%{$search}%")
                                        ->orWhere('name', 'LIKE', "%{$search}%");
                        })->orWhereHas('tenant', function ($tenantQuery) use ($search) {
                            $tenantQuery->where('name', 'LIKE', "%{$search}%")
                                        ->orWhere('contact', 'LIKE', "%{$search}%");
                        });
                    });
                })
                ->orderBy('id', 'desc')
                ->paginate(10);
        } catch (\Exception $e) {
            Log::error("Failed to retrieve bookings", [
                'message' => $e->getMessage(),
                'search' => $search,
                'status' => $status,
                'trace' => $e->getTraceAsString(),
            ]);
            return [];
        }
    }

    /**
     * Update the status of a booking.
     *
     * @param int $bookingId
     * @param string $status
     * @return Booking|null
     * @throws ModelNotFoundException
     */
    public function updateStatus(int $bookingId, string $status): ?Booking
    {
        try {
            $booking = $this->booking->findOrFail($bookingId);
            $booking->status = $status;
            $booking->save();

            return $booking;
        } catch (ModelNotFoundException $e) {
            Log::error("Booking not found", [
                'booking_id' => $bookingId,
                'exception' => $e,
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error("Failed to update booking status", [
                'booking_id' => $bookingId,
                'status' => $status,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Void a booking by updating its status.
     *
     * @param int $bookingId
     * @param string $status
     * @return Booking|null
     * @throws ModelNotFoundException
     */
    public function voidBooking(int $bookingId, string $status): ?Booking
    {
        try {
            $booking = $this->booking->findOrFail($bookingId);
            $booking->status = $status;
            $booking->save();

            return $booking;
        } catch (ModelNotFoundException $e) {
            Log::error("Booking not found", [
                'booking_id' => $bookingId,
                'exception' => $e,
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error("Failed to void booking status", [
                'booking_id' => $bookingId,
                'status' => $status,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Create a new booking and associated tenant.
     *
     * @param array $data
     * @return Booking|null
     */
    public function createBooking(array $data): ?Booking
    {
        try {
            // Step 1: Save tenant first
            $tenant = Tenant::create([
                'name' => $data['name'],
                'contact' => $data['contact'],
                'address' => $data['address'],
                // Add any other tenant fields here
            ]);
    
            // Step 2: Get check-in and check-out datetimes
            $checkIn = Carbon::now('Asia/Manila');
            $checkOut = $checkIn->copy()->addHours((int) $data['total_duration_hours']);

            // Step 3: Inject computed data
            $data['tenant_id'] = $tenant->id;
            $data['check_in'] = $checkIn;
            $data['check_out'] = $checkOut;

            // Step 4: Save booking
            return $this->booking->create([
                'tenant_id' => $tenant->id,
                'room_id' => $data['room_id'],
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'total_duration_hours' => $data['total_duration_hours'],
                'total_amount' => $data['total_amount'],
                'status' => 'active',
            ]);
    
        } catch (\Exception $e) {
            Log::error("Failed to create booking", [
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }
}
