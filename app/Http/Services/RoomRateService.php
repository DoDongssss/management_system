<?php

namespace App\Http\Services;

use Exception;
use App\Models\RoomRate;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RoomRateService
{
    protected RoomRate $roomRate;

    public function __construct(RoomRate $roomRate)
    {
        $this->roomRate = $roomRate;
    }

    /**
     * Get all active room rates.
     */
    public function getActiveRoomRates()
    {
        try {
            return $this->roomRate
                ->where('is_active', 1)
                ->select('id', 'room_id', 'durations_hours', 'price')
                ->get();
        } catch (Exception $e) {
            Log::error("Error fetching active room rates: " . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get paginated room rates with optional search and sorting.
     */
    public function getRoomRates($sort = 'id', $direction = 'desc', $perPage = 10, $search = null, $status = 'all')
    {
        try {
            return $this->roomRate
                ->when($status !== "all", fn($q) => $q->where('is_active', (int) $status))
                ->when($search, fn($q) =>
                    $q->whereHas('room', fn($query) =>
                        $query->where('name', 'LIKE', "%{$search}%")
                    )
                )
                ->with('room:id,name') // eager load room relationship
                ->orderBy('is_active', 'desc')
                ->orderBy($sort, $direction)
                ->paginate($perPage);
        } catch (Exception $e) {
            Log::error("Error fetching room rates: " . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get a specific room rate by ID.
     */
    public function getRoomRateById(string $id): ?RoomRate
    {
        try {
            return $this->roomRate->with('room:id,name')->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Room rate not found: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error fetching room rate: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a new room rate.
     */
    public function createRoomRate(array $data): ?RoomRate
    {
        try {
            return $this->roomRate->create([
                'room_id'         => $data['room_id'],
                'durations_hours' => $data['durations_hours'],
                'price'           => $data['price'],
                'is_active'       => $data['is_active'] ?? 1,
            ]);
        } catch (Exception $e) {
            Log::error("Error creating room rate: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update an existing room rate.
     */
    public function updateRoomRate(string $id, array $data): ?RoomRate
    {
        try {
            $roomRate = $this->roomRate->findOrFail($id);

            $roomRate->update([
                'room_id'         => $data['room_id'],
                'durations_hours' => $data['durations_hours'],
                'price'           => $data['price'],
                'is_active'       => $data['is_active'] ?? $roomRate->is_active,
            ]);

            return $roomRate;
        } catch (ModelNotFoundException $e) {
            Log::error("Room rate not found for update: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error updating room rate: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a room rate.
     */
    public function deleteRoomRate(string $id): bool
    {
        try {
            $roomRate = $this->roomRate->findOrFail($id);
            $roomRate->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Room rate not found for deletion: ID {$id}");
            return false;
        } catch (Exception $e) {
            Log::error("Error deleting room rate: " . $e->getMessage());
            return false;
        }
    }
}
