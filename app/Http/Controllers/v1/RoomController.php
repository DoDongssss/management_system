<?php

namespace App\Http\Controllers\v1;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Services\RoomService;
use App\Http\Services\AmenityService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\RoomRequest;
use Exception;

class RoomController extends Controller
{
    protected $roomService;
    protected $amenityService;

    public function __construct(RoomService $roomService, AmenityService $amenityService)
    {
        $this->roomService = $roomService;
        $this->amenityService = $amenityService;
    }

    /**
     * Display a listing of the rooms.
     */
    public function index(Request $request): Response
    {
        try {
            $sort = $request->get('sort', 'id');
            $direction = $request->get('direction', 'desc');
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search');
            $status = $request->get('status') ?? 'all';

            $rooms = $this->roomService->getRooms($sort, $direction, $perPage, $search, $status);
            $amenities = $this->amenityService->getActiveAmenities();

            return Inertia::render('admin/room/index', [
                'rooms' => $rooms,
                'amenities' => $amenities,
                'filters' => compact('sort', 'direction', 'perPage', 'search', 'status'),
            ]);
        } catch (Exception $e) {
            Log::error("Error fetching rooms: " . $e->getMessage());

            return Inertia::render('admin/room/index', [
                'rooms' => [],
                'amenities' => [],
                'filters' => $request->only(['sort', 'direction', 'perPage', 'search', 'status']),
                'error' => 'Failed to fetch rooms. Please try again.',
            ]);
        }
    }

    /**
     * Store a newly created room.
     */
    public function store(RoomRequest $request): RedirectResponse
    {
        try {
            $this->roomService->createRoom($request->validated());

            return redirect()->route('room.index')->with('success', 'Room created successfully!');
        } catch (Exception $e) {
            Log::error("Error creating room: " . $e->getMessage());

            return redirect()->route('room.index')->with('error', 'Failed to create room.');
        }
    }

    /**
     * Update the specified room.
     */
    public function update(RoomRequest $request, string $id): RedirectResponse
    {
        try {
            $updatedRoom = $this->roomService->updateRoom($id, $request->validated());

            if (!$updatedRoom) {
                return redirect()->route('room.index')->with('error', 'Room not found.');
            }

            return redirect()->route('room.index')->with('success', 'Room updated successfully!');
        } catch (Exception $e) {
            Log::error("Error updating room (ID: $id): " . $e->getMessage());

            return redirect()->route('room.index')->with('error', 'Failed to update room.');
        }
    }

    /**
     * Remove the specified room.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $deleted = $this->roomService->deleteRoom($id);

            if (!$deleted) {
                return back()->withErrors(['error' => 'Room not found or could not be deleted.']);
            }

            return back()->with('success', 'Room deleted successfully!');
        } catch (Exception $e) {
            Log::error("Error deleting room (ID: $id): " . $e->getMessage());

            return back()->withErrors(['error' => 'Failed to delete room.']);
        }
    }
}
