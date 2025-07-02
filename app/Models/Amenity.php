<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Amenity Model
 *
 * @property int $id
 * @property string $name
 * @property string|null $icon
 * @property bool $is_active
 */
class Amenity extends Model
{
    use HasFactory;

    protected $table = 'amenities';

    protected $fillable = [
        'name',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * The rooms that belong to the amenity.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function rooms()
    {
        return $this->belongsToMany(Room::class, 'room_amenity')
            ->withPivot('is_active');
    }
}
