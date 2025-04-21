<?php

namespace App\Models;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

}
