<?php

namespace App\Models;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Tenant Model
 *
 * @property int $id
 * @property string $name
 * @property string $contact
 * @property string $address
 * @property bool $is_active
 */
class Tenant extends Model
{
    use HasFactory;

    protected $table = 'tenants';

    protected $fillable = [
        'name',
        'contact',
        'address',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the bookings for the tenant.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function booking()
    {
        return $this->hasMany(Booking::class);
    }
}
