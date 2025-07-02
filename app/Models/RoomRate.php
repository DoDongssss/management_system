<?php

namespace App\Models;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * RoomRate Model
 *
 * @property int $id
 * @property int $room_id
 * @property int $durations_hours
 * @property float $price
 * @property bool $is_active
 */
class RoomRate extends Model
{
    use HasFactory;

    protected $table = 'rates';

    protected $fillable = [
        'room_id',
        'durations_hours',
        'price',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'float',
    ];

    /**
     * Get the room for this rate.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
