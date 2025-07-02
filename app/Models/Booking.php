<?php

namespace App\Models;

use App\Models\Room;
use App\Models\Tenant;
use App\Models\Amenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Booking Model
 *
 * @property int $id
 * @property int $tenant_id
 * @property int $room_id
 * @property int $total_duration_hours
 * @property float $total_amount
 * @property \Carbon\Carbon $check_in
 * @property \Carbon\Carbon $check_out
 * @property string $status
 * @property bool $is_active
 */
class Booking extends Model
{
    use HasFactory;

    protected $table = 'bookings';

    protected $fillable = [
        'tenant_id',
        'room_id',
        'total_duration_hours',
        'total_amount',
        'check_in',
        'check_out',
        'status',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'total_amount' => 'float',
    ];

    /**
     * Get the tenant for the booking.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the room for the booking.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

}
