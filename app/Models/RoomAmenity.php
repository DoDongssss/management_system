<?php

namespace App\Models;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * RoomAmenity Model
 *
 * @property int $id
 * @property int $room_id
 * @property int $amenity_id
 * @property bool $is_active
 */
class RoomAmenity extends Model
{
    use HasFactory;

    protected $table = 'room_amenity';

    protected $fillable = [
        'room_id',
        'amenity_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the amenity for this room-amenity link.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function amenity()
    {
        return $this->belongsTo(Amenity::class);
    }

    /**
     * Get the room for this room-amenity link.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

}
