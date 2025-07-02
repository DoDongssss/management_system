<?php

namespace App\Http\Services;

use Exception;
use App\Models\Room;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RoomService
{
    protected Room $room;

    public function __construct(Room $room)
    {
        $this->room = $room;
    }

    /**
     * Get all active rooms with related data.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getActiveRooms(): \Illuminate\Support\Collection
    {
        try {
            return $this->room
                ->with(['rates', 'roomAmenities', 'roomAmenities.amenity'])
                ->where('is_active', 1)
                ->select('id', 'room_number', 'name')
                ->get();
        } catch (\Exception $e) {
            Log::error("Error fetching active rooms", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return collect();
        }
    }

    /**
     * Get all active rooms with booking status and related data.
     *
     * @param string|null $search
     * @param string|int|bool $status
     * @return \Illuminate\Support\Collection
     */
    public function getActiveRoomsWithBookingStatus($search = null, $status = "all"): \Illuminate\Support\Collection
    {
        try {
            return $this->room
                ->with([
                    'rates',
                    'booking' => function ($query) {
                        $query->where('status', 'active');
                    },
                    'booking.tenant'
                ])
                ->where('is_active', 1)
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($q) use ($search) {
                        $q->where('room_number', 'LIKE', "%{$search}%")
                        ->orWhere('name', 'LIKE', "%{$search}%");
                    });
                })
                ->when($status === '1' || $status === true, function ($q) {
                    $q->whereHas('booking', function ($query) {
                        $query->where('status', 'active');
                    });
                })
                ->when($status === '0' || $status === false, function ($q) {
                    $q->whereDoesntHave('booking', function ($query) {
                        $query->where('status', 'active');
                    });
                })
                ->get();
        } catch (\Exception $e) {
            Log::error("Error fetching active rooms with booking status", [
                'search' => $search,
                'status' => $status,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return collect();
        }
    }

    /**
     * Get paginated rooms with optional search and sorting.
     *
     * @param string $sort
     * @param string $direction
     * @param int $perPage
     * @param string|null $search
     * @param string|int|bool $status
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection
     */
    public function getRooms(string $sort = 'id', string $direction = 'desc', int $perPage = 10, ?string $search = null, $status = "all")
    {
        try {
            $query = $this->room->with(['roomAmenities', 'roomAmenities.amenity', 'rates'])
                ->when($status !== "all", function ($q) use ($status) {
                    $q->where('is_active',  (int) $status);
                })
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($q) use ($search) {
                        $q->where('room_number', 'LIKE', "%{$search}%")
                          ->orWhere('name', 'LIKE', "%{$search}%");
                    });
                })
                ->orderBy('is_active', 'desc')
                ->orderBy($sort, $direction);
            return $query->paginate($perPage);
        } catch (Exception $e) {
            Log::error("Error fetching rooms", [
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
     * Get a specific room by ID.
     *
     * @param string $id
     * @return Room|null
     * @throws ModelNotFoundException
     */
    public function getRoomById(string $id): ?Room
    {
        try {
            return $this->room->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Room not found", [
                'room_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error fetching room", [
                'room_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Create a new room.
     *
     * @param array $data
     * @return Room|null
     */
    public function createRoom(array $data): ?Room
    {
        try {
            if (isset($data['image']) && $data['image']->isValid()) {
                $data['image'] = $data['image']->store('rooms', 'public');
            }

            $amenityIds = [];
            if (!empty($data['room_amenities'])) {
                $amenityIds = explode(',', $data['room_amenities']);
                $amenityIds = array_map('intval', $amenityIds);
            }

            $room = $this->room->create([
                'room_number' => $data['room_number'],
                'name' => $data['name'],
                'type' => $data['type'],
                'image' => $data['image'] ?? null,
                'status' => $data['status'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            if ($room && !empty($amenityIds)) {
                foreach ($amenityIds as $amenityId) {
                    $room->roomAmenities()->create([
                        'amenity_id' => $amenityId,
                        'is_active' => true,
                    ]);
                }
            }

            return $room;
        } catch (Exception $e) {
            Log::error("Error creating room", [
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Update an existing room.
     *
     * @param string $id
     * @param array $data
     * @return Room|null
     * @throws ModelNotFoundException
     */
    public function updateRoom(string $id, array $data): ?Room
    {
        try {
            $room = $this->room->findOrFail($id);

            if (isset($data['image']) && $data['image']->isValid()) {
                if ($room->image) {
                    Storage::disk('public')->delete($room->image);
                }
                $data['image'] = $data['image']->store('rooms', 'public');
            } else {
                $data['image'] = $room->image; // Keep the existing image
            }

            $room->update([
                'room_number' => $data['room_number'],
                'name' => $data['name'],
                'type' => $data['type'],
                'image' => $data['image'],
                'status' => $data['status'],
                'is_active' => $data['is_active'] ?? $room->is_active,
            ]);

            if (!empty($data['room_amenities'])) {
                $amenityIds = explode(',', $data['room_amenities']);
                $amenityIds = array_map('intval', $amenityIds);

                $room->roomAmenities()->delete();

                foreach ($amenityIds as $amenityId) {
                    $room->roomAmenities()->create([
                        'amenity_id' => $amenityId,
                        'is_active' => true,
                    ]);
                }
            }

            return $room;
        } catch (ModelNotFoundException $e) {
            Log::error("Room not found for update", [
                'room_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error updating room", [
                'room_id' => $id,
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Delete a room by ID.
     *
     * @param string $id
     * @return bool
     * @throws ModelNotFoundException
     */
    public function deleteRoom(string $id): bool
    {
        try {
            $room = $this->room->findOrFail($id);
            $room->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Room not found for deletion", [
                'room_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error deleting room", [
                'room_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
}
