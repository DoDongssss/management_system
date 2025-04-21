<?php

namespace App\Http\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BookingService
{
    /**
     * Update the status of a booking.
     *
     * @param int $bookingId
     * @param string $status
     * @return Booking|null
     */
    public function updateStatus(int $bookingId, string $status): ?Booking
    {
        try {
            $booking = Booking::findOrFail($bookingId);
            $booking->status = $status;
            $booking->save();

            return $booking;
        } catch (ModelNotFoundException $e) {
            Log::error("Booking not found: ID {$bookingId}");
            return null;
        } catch (\Exception $e) {
            Log::error("Failed to update booking status: " . $e->getMessage());
            return null;
        }
    }
}
