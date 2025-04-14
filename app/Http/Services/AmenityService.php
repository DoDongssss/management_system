<?php

namespace App\Http\Services;

use Exception;
use App\Models\Amenity;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AmenityService
{
    protected Amenity $amenity;

    public function __construct(Amenity $amenity)
    {
        $this->amenity = $amenity;
    }

    /**
     * Get paginated amenities with optional search and sorting.
     */
    public function getAmenities($sort = 'id', $direction = 'desc', $perPage = 10, $search = null)
    {
        try {
            return $this->amenity
                ->when($search, fn($q) => $q->where('name', 'LIKE', "%{$search}%"))
                ->orderBy('is_active', 'desc')
                ->orderBy($sort, $direction)
                ->paginate($perPage);
        } catch (Exception $e) {
            Log::error("Error fetching amenities: " . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get a specific amenity by ID.
     */
    public function getAmenityById(string $id): ?Amenity
    {
        try {
            return $this->amenity->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Amenity not found: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error fetching amenity: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a new amenity.
     */
    public function createAmenity(array $data): ?Amenity
    {
        try {
            return $this->amenity->create([
                'name'      => $data['name'],
                'icon'      => $data['icon'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);
        } catch (Exception $e) {
            Log::error("Error creating amenity: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update an existing amenity.
     */
    public function updateAmenity(string $id, array $data): ?Amenity
    {
        try {
            $amenity = $this->amenity->findOrFail($id);

            $amenity->update([
                'name'      => $data['name'],
                'icon'      => $data['icon'],
                'is_active' => $data['is_active'] ?? $amenity->is_active,
            ]);

            return $amenity;
        } catch (ModelNotFoundException $e) {
            Log::error("Amenity not found for update: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error updating amenity: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete an amenity.
     */
    public function deleteAmenity(string $id): bool
    {
        try {
            $amenity = $this->amenity->findOrFail($id);
            $amenity->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Amenity not found for deletion: ID {$id}");
            return false;
        } catch (Exception $e) {
            Log::error("Error deleting amenity: " . $e->getMessage());
            return false;
        }
    }
}
