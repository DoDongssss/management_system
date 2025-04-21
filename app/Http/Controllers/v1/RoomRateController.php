<?php

namespace App\Http\Controllers\v1;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Services\RoomRateService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\RoomRateRequest;
use Exception;

class RoomRateController extends Controller
{
    protected $roomRateService;

    public function __construct(RoomRateService $roomRateService)
    {
        $this->roomRateService = $roomRateService;
    }

    /**
     * Display a listing of the room rates.
     */
    public function index(Request $request): Response
    {
        try {
            $sort = $request->get('sort', 'id');
            $direction = $request->get('direction', 'desc');
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search');
            $status = $request->get('status') ?? 'all';

            $roomRates = $this->roomRateService->getRoomRates($sort, $direction, $perPage, $search, $status);

            return Inertia::render('admin/room/index', [
                'roomRates' => $roomRates,
                'filters' => compact('sort', 'direction', 'perPage', 'search'),
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching room rates: " . $e->getMessage());

            return Inertia::render('admin/room/index', [
                'roomRates' => [],
                'filters' => $request->only(['sort', 'direction', 'perPage', 'search']),
                'error' => 'Failed to fetch room rates. Please try again.',
            ]);
        }
    }

    /**
     * Store a newly created room rate.
     */
    public function store(RoomRateRequest $request): RedirectResponse
    {
        try {
            $this->roomRateService->createRoomRate($request->validated());

            return redirect()->route('room.index')->with('success', 'Room rate created successfully!');
        } catch (Exception $e) {
            Log::error("Error creating room rate: " . $e->getMessage());

            return redirect()->route('room.index')->with('error', 'Failed to create room rate.');
        }
    }

    /**
     * Update the specified room rate.
     */
    public function update(RoomRateRequest $request, string $id): RedirectResponse
    {
        try {
            $updatedRoomRate = $this->roomRateService->updateRoomRate($id, $request->validated());

            if (!$updatedRoomRate) {
                return redirect()->route('room.index')->with('error', 'Room rate not found.');
            }

            return redirect()->route('room.index')->with('success', 'Room rate updated successfully!');
        } catch (Exception $e) {
            Log::error("Error updating room rate (ID: $id): " . $e->getMessage());

            return redirect()->route('room.index')->with('error', 'Failed to update room rate.');
        }
    }

    /**
     * Remove the specified room rate.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $deleted = $this->roomRateService->deleteRoomRate($id);

            if (!$deleted) {
                return back()->withErrors(['error' => 'Room rate not found or could not be deleted.']);
            }

            return back()->with('success', 'Room rate deleted successfully!');
        } catch (Exception $e) {
            Log::error("Error deleting room rate (ID: $id): " . $e->getMessage());

            return back()->withErrors(['error' => 'Failed to delete room rate.']);
        }
    }
}
