<?php

namespace App\Models;

use App\Models\RoomAmenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    public function roomAmenities()
    {
        return $this->hasMany(RoomAmenity::class);
    }
}
