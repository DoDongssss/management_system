<?php

namespace App\Http\Controllers\v1;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Services\AmenityService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\AmenityRequest;
use Exception;

class AmenityController extends Controller
{
    protected $amenityService;

    public function __construct(AmenityService $amenityService)
    {
        $this->amenityService = $amenityService;
    }

    /**
     * Display a listing of the amenities.
     */
    public function index(Request $request): Response
    {
        try {
            $sort = $request->get('sort', 'id');
            $direction = $request->get('direction', 'desc');
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search');
            $status = $request->get('status') ?? 'all';

            $amenities = $this->amenityService->getAmenities($sort, $direction, $perPage, $search, $status);

            return Inertia::render('admin/amenity/index', [
                'amenities' => $amenities,
                'filters' => compact('sort', 'direction', 'perPage', 'search'),
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching amenities: " . $e->getMessage());

            return Inertia::render('admin/amenity/index', [
                'amenities' => [],
                'filters' => $request->only(['sort', 'direction', 'perPage', 'search']),
                'error' => 'Failed to fetch amenities. Please try again.',
            ]);
        }
    }

    /**
     * Store a newly created amenity.
     */
    public function store(AmenityRequest $request): RedirectResponse
    {
        try {
            $this->amenityService->createAmenity($request->validated());

            return redirect()->route('amenity.index')->with('success', 'Amenity created successfully!');
        } catch (Exception $e) {
            Log::error("Error creating amenity: " . $e->getMessage());

            return redirect()->route('amenity.index')->with('error', 'Failed to create amenity.');
        }
    }

    /**
     * Update the specified amenity.
     */
    public function update(AmenityRequest $request, string $id): RedirectResponse
    {
        try {
            $updatedAmenity = $this->amenityService->updateAmenity($id, $request->validated());

            if (!$updatedAmenity) {
                return redirect()->route('amenity.index')->with('error', 'Amenity not found.');
            }

            return redirect()->route('amenity.index')->with('success', 'Amenity updated successfully!');
        } catch (Exception $e) {
            Log::error("Error updating amenity (ID: $id): " . $e->getMessage());

            return redirect()->route('amenity.index')->with('error', 'Failed to update amenity.');
        }
    }

    /**
     * Remove the specified amenity.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $deleted = $this->amenityService->deleteAmenity($id);

            if (!$deleted) {
                return back()->withErrors(['error' => 'Amenity not found or could not be deleted.']);
            }

            return back()->with('success', 'Amenity deleted successfully!');
        } catch (Exception $e) {
            Log::error("Error deleting amenity (ID: $id): " . $e->getMessage());

            return back()->withErrors(['error' => 'Failed to delete amenity.']);
        }
    }
}
