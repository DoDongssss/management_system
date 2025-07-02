<?php

namespace App\Models;

use App\Models\Tenant;
use App\Models\Booking;
use App\Models\RoomAmenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Room Model
 *
 * @property int $id
 * @property string $room_number
 * @property string $name
 * @property string $type
 * @property string|null $image
 * @property string $status
 * @property bool $is_active
 */
class Room extends Model
{
    use HasFactory;

    protected $table = 'rooms';

    protected $fillable = [
        'room_number',
        'name',
        'type',
        'image',
        'status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the room amenities for the room.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function roomAmenities()
    {
        return $this->hasMany(RoomAmenity::class);
    }

    /**
     * Get the rates for the room.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function rates()
    {
        return $this->hasMany(RoomRate::class);
    }

    /**
     * Get the bookings for the room.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function booking()
    {
        return $this->hasMany(Booking::class);
    }
}
