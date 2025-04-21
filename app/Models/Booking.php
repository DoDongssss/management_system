<?php

namespace App\Models;

use App\Models\Room;
use App\Models\Tenant;
use App\Models\Amenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

}
