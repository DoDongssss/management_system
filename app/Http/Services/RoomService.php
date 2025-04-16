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
     * Get paginated rooms with optional search and sorting.
     */
    public function getRooms($sort = 'id', $direction = 'desc', $perPage = 10, $search = null, $status = "all")
    {
        // dd($status);
        try {
            $query = $this->room->with(['roomAmenities', 'roomAmenities.amenity'])
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
            Log::error("Error fetching rooms: " . $e->getMessage());
            return collect(); 
        }
    }

    /**
     * Get a specific room by ID.
     */
    public function getRoomById(string $id): ?Room
    {
        try {
            return $this->room->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Room not found: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error fetching room: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a new room.
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
            Log::error("Error creating room: " . $e->getMessage());
            return null;
        }
    }
    

    /**
     * Update an existing room.
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
            Log::error("Room not found for update: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error updating room: " . $e->getMessage());
            return null;
        }
    }
    

    /**
     * Soft-delete a room (mark as inactive or delete).
     */
    public function deleteRoom(string $id): bool
    {
        try {
            $room = $this->room->findOrFail($id);
            $room->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Room not found for deletion: ID {$id}");
            return false;
        } catch (Exception $e) {
            Log::error("Error deleting room: " . $e->getMessage());
            return false;
        }
    }
}
