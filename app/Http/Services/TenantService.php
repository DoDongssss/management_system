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
     * Get all active tenants.
     */
    public function getActiveTenants()
    {
        try {
            return $this->tenant->with(['bookings'])
                ->where('is_active', 1)
                ->select('id', 'name', 'contact', 'address')
                ->get();
        } catch (Exception $e) {
            Log::error("Error fetching active tenants: " . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get paginated tenants with optional search and sorting.
     */
    public function getTenants($sort = 'id', $direction = 'desc', $perPage = 10, $search = null, $status = 'all')
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
            Log::error("Error fetching tenants: " . $e->getMessage());
            return collect();
        }
    }

    /**
     * Get a specific tenant by ID.
     */
    public function getTenantById(string $id): ?Tenant
    {
        try {
            return $this->tenant->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::error("Tenant not found: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error fetching tenant: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a new tenant.
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
            Log::error("Error creating tenant: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update an existing tenant.
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
            Log::error("Tenant not found for update: ID {$id}");
            return null;
        } catch (Exception $e) {
            Log::error("Error updating tenant: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a tenant.
     */
    public function deleteTenant(string $id): bool
    {
        try {
            $tenant = $this->tenant->findOrFail($id);
            $tenant->delete();
            return true;
        } catch (ModelNotFoundException $e) {
            Log::error("Tenant not found for deletion: ID {$id}");
            return false;
        } catch (Exception $e) {
            Log::error("Error deleting tenant: " . $e->getMessage());
            return false;
        }
    }
}
