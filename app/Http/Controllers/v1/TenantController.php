<?php

namespace App\Http\Controllers\v1;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Services\TenantService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\TenantRequest;
use Exception;

class TenantController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of the tenants.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        try {
            $sort = $request->get('sort', 'id');
            $direction = $request->get('direction', 'desc');
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search');
            $status = $request->get('status') ?? 'all';

            $tenants = $this->tenantService->getTenants($sort, $direction, $perPage, $search, $status);

            return Inertia::render('admin/tenant/index', [
                'tenants' => $tenants,
                'filters' => compact('sort', 'direction', 'perPage', 'search'),
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching tenants", [
                'message' => $e->getMessage(),
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return Inertia::render('admin/tenant/index', [
                'tenants' => [],
                'filters' => $request->only(['sort', 'direction', 'perPage', 'search']),
                'error' => 'Failed to fetch tenants. Please try again.',
            ]);
        }
    }

    /**
     * Store a newly created tenant.
     *
     * @param TenantRequest $request
     * @return RedirectResponse
     */
    public function store(TenantRequest $request): RedirectResponse
    {
        try {
            $this->tenantService->createTenant($request->validated());

            return redirect()->route('tenant.index')->with('success', 'Tenant created successfully!');
        } catch (Exception $e) {
            Log::error("Error creating tenant", [
                'message' => $e->getMessage(),
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('tenant.index')->with('error', 'Failed to create tenant.');
        }
    }

    /**
     * Update the specified tenant.
     *
     * @param TenantRequest $request
     * @param string $id
     * @return RedirectResponse
     */
    public function update(TenantRequest $request, string $id): RedirectResponse
    {
        try {
            $updatedTenant = $this->tenantService->updateTenant($id, $request->validated());

            if (!$updatedTenant) {
                return redirect()->route('tenant.index')->with('error', 'Tenant not found.');
            }

            return redirect()->route('tenant.index')->with('success', 'Tenant updated successfully!');
        } catch (Exception $e) {
            Log::error("Error updating tenant", [
                'tenant_id' => $id,
                'message' => $e->getMessage(),
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('tenant.index')->with('error', 'Failed to update tenant.');
        }
    }

    /**
     * Remove the specified tenant.
     *
     * @param string $id
     * @return RedirectResponse
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $deleted = $this->tenantService->deleteTenant($id);

            if (!$deleted) {
                return back()->withErrors(['error' => 'Tenant not found or could not be deleted.']);
            }

            return back()->with('success', 'Tenant deleted successfully!');
        } catch (Exception $e) {
            Log::error("Error deleting tenant", [
                'tenant_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete tenant.']);
        }
    }
}
