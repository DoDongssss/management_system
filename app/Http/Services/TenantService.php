<?php

namespace App\Http\Services;

use Exception;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TenantService
{
    protected Tenant $tenant;

    public function __construct(Tenant $tenant)
    {
        $this->tenant = $tenant;
    }

    /**
     * Get all active tenants with related bookings.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getActiveTenants(): \Illuminate\Support\Collection
    {
        try {
            return $this->tenant->with(['bookings'])
                ->where('is_active', 1)
                ->select('id', 'name', 'contact', 'address')
                ->get();
        } catch (Exception $e) {
            Log::error("Error fetching active tenants", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return collect();
        }
    }

    /**
     * Get paginated tenants with optional search and sorting.
     *
     * @param string $sort
     * @param string $direction
     * @param int $perPage
     * @param string|null $search
     * @param string|int|bool $status
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection
     */
    public function getTenants(string $sort = 'id', string $direction = 'desc', int $perPage = 10, ?string $search = null, $status = 'all')
    {
        try {
            return $this->tenant->with(['booking', 'booking.room'])
                ->when($status !== "all", function ($q) use ($status) {
                    $q->where('is_active', (int) $status);
                })
                ->when($search, fn($q) => $q->where('name', 'LIKE', "%{$search}%"))
                ->orderBy('is_active', 'desc')
                ->orderBy('id', 'desc')
                ->paginate($perPage);
        } catch (Exception $e) {
            Log::error("Error fetching tenants", [
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
     * Get a specific tenant by ID.
     *
     * @param string $id
     * @return Tenant|null
     * @throws ModelNotFoundException
     */
    public function getTenantById(string $id): ?Tenant
    {
        try {
            return $this->tenant->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Tenant not found", [
                'tenant_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error fetching tenant", [
                'tenant_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Create a new tenant.
     *
     * @param array $data
     * @return Tenant|null
     */
    public function createTenant(array $data): ?Tenant
    {
        try {
            return $this->tenant->create([
                'name'      => $data['name'],
                'contact'   => $data['contact'],
                'address'   => $data['address'],
                'is_active' => $data['is_active'] ?? true,
            ]);
        } catch (Exception $e) {
            Log::error("Error creating tenant", [
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Update an existing tenant.
     *
     * @param string $id
     * @param array $data
     * @return Tenant|null
     * @throws ModelNotFoundException
     */
    public function updateTenant(string $id, array $data): ?Tenant
    {
        try {
            $tenant = $this->tenant->findOrFail($id);

            $tenant->update([
                'name'      => $data['name'],
                'contact'   => $data['contact'],
                'address'   => $data['address'],
                'is_active' => $data['is_active'] ?? $tenant->is_active,
            ]);

            return $tenant;
        } catch (ModelNotFoundException $e) {
            Log::error("Tenant not found for update", [
                'tenant_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error updating tenant", [
                'tenant_id' => $id,
                'data' => $data,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Delete a tenant.
     *
     * @param string $id
     * @return bool
     * @throws ModelNotFoundException
     */
    public function deleteTenant(string $id): bool
    {
        try {
            $tenant = $this->tenant->findOrFail($id);
            $tenant->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Tenant not found for deletion", [
                'tenant_id' => $id,
                'exception' => $e,
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error("Error deleting tenant", [
                'tenant_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
}
