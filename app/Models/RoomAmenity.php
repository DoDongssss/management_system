<?php

namespace App\Models;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomAmenity extends Model
{
    use HasFactory;

    protected $table = 'room_amenity';

    protected $fillable = [
        'room_id',
        'amenity_id',
        'is_active',
    ];

    public function amenity()
    {
        return $this->belongsTo(Amenity::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

}
