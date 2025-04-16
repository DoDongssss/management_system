<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Amenity extends Model
{
    use HasFactory;

    protected $table = 'amenities';

    protected $fillable = [
        'name',
        'icon',
        'is_active',
    ];

    public function rooms()
{
    return $this->belongsToMany(Room::class, 'room_amenity')
        ->withPivot('is_active');
}
}
