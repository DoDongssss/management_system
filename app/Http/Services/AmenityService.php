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
     * Get all active amenities with related rooms.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getActiveAmenities(): \Illuminate\Support\Collection
    {
        try {
            return $this->amenity
                ->with('rooms')
                ->where('is_active', 1)
                ->select('id', 'name', 'icon')
                ->get();
        } catch (Exception $e) {
            Log::error("Error fetching active amenities", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return collect();
        }
    }

    /**
     * Get paginated amenities with optional search and sorting.
     *
     * @param string $sort
     * @param string $direction
     * @param int $perPage
     * @param string|null $search
     * @param string|int|bool $status
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection
     */
    public function getAmenities(string $sort = 'id', string $direction = 'desc', int $perPage = 10, ?string $search = null, $status = 'all')
    {
        try {
            return $this->amenity
                ->when($status !== "all", function ($q) use ($status) {
                    $q->where('is_active',  (int) $status);
                })
                ->when($search, fn($q) => $q->where('name', 'LIKE', "%{$search}%"))
                ->orderBy('is_active', 'desc')
                ->orderBy('id', 'desc')
                ->paginate($perPage);
        } catch (Exception $e) {
            Log::error("Error fetching amenities", [
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
     * Get a specific amenity by ID.
     *
     * @param string $id
     * @return Amenity|null
     * @throws ModelNotFoundException
     */
    public function getAmenityById(string $id): ?Amenity
    {
        try {
            return $this->amenity->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Amenity not found", [
                'amenity_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error fetching amenity", [
                'amenity_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Create a new amenity.
     *
     * @param array $data
     * @return Amenity|null
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
            Log::error("Error creating amenity", [
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Update an existing amenity.
     *
     * @param string $id
     * @param array $data
     * @return Amenity|null
     * @throws ModelNotFoundException
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
            Log::error("Amenity not found for update", [
                'amenity_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error updating amenity", [
                'amenity_id' => $id,
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Delete an amenity.
     *
     * @param string $id
     * @return bool
     * @throws ModelNotFoundException
     */
    public function deleteAmenity(string $id): bool
    {
        try {
            $amenity = $this->amenity->findOrFail($id);
            $amenity->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Amenity not found for deletion", [
                'amenity_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error deleting amenity", [
                'amenity_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
}
