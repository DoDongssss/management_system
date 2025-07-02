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
     *
     * @return \Illuminate\Support\Collection
     */
    public function getActiveRoomRates(): \Illuminate\Support\Collection
    {
        try {
            return $this->roomRate
                ->where('is_active', 1)
                ->select('id', 'room_id', 'durations_hours', 'price')
                ->get();
        } catch (Exception $e) {
            Log::error("Error fetching active room rates", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return collect();
        }
    }

    /**
     * Get paginated room rates with optional search and sorting.
     *
     * @param string $sort
     * @param string $direction
     * @param int $perPage
     * @param string|null $search
     * @param string|int|bool $status
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection
     */
    public function getRoomRates(string $sort = 'id', string $direction = 'desc', int $perPage = 10, ?string $search = null, $status = 'all')
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
                ->orderBy('id', 'desc')
                ->paginate($perPage);
        } catch (Exception $e) {
            Log::error("Error fetching room rates", [
                'sort' => $sort,
                'direction' => $direction,
                'perPage' => $perPage,
                'search' => $search,
                'status' => $status,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return collect();
        }
    }

    /**
     * Get a specific room rate by ID.
     *
     * @param string $id
     * @return RoomRate|null
     * @throws ModelNotFoundException
     */
    public function getRoomRateById(string $id): ?RoomRate
    {
        try {
            return $this->roomRate->with('room:id,name')->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Room rate not found", [
                'room_rate_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error fetching room rate", [
                'room_rate_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Create a new room rate.
     *
     * @param array $data
     * @return RoomRate|null
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
            Log::error("Error creating room rate", [
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Update an existing room rate.
     *
     * @param string $id
     * @param array $data
     * @return RoomRate|null
     * @throws ModelNotFoundException
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
            Log::error("Room rate not found for update", [
                'room_rate_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error updating room rate", [
                'room_rate_id' => $id,
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Delete a room rate.
     *
     * @param string $id
     * @return bool
     * @throws ModelNotFoundException
     */
    public function deleteRoomRate(string $id): bool
    {
        try {
            $roomRate = $this->roomRate->findOrFail($id);
            $roomRate->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Room rate not found for deletion", [
                'room_rate_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error deleting room rate", [
                'room_rate_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
}
