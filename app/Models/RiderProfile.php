<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiderProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'id_number',
        'alt_phone',
        'emergency_contact_name',
        'emergency_contact_phone',
        'license_number',
        'vehicle_type',
        'vehicle_make',
        'vehicle_model',
        'vehicle_plate',
        'documents',
        'bank_account_number',
        'bank_name',
        'verification_status',
        'profile_completed',
        'is_online',
        'current_latitude',
        'current_longitude',
        'delivery_radius',
        'work_hours',
        'preferred_areas',
        'earnings_today',
        'total_earnings',
    ];

    protected $casts = [
        'documents' => 'array',
        'work_hours' => 'array',
        'preferred_areas' => 'array',
        'profile_completed' => 'boolean',
        'is_online' => 'boolean',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'earnings_today' => 'decimal:2',
        'total_earnings' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'rider_id', 'user_id');
    }

    /**
     * Scopes
     */
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopeOnline($query)
    {
        return $query->where('is_online', true);
    }

    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        return $query->selectRaw("
            *, ( 6371 * acos( cos( radians(?) ) * 
            cos( radians( current_latitude ) ) * cos( radians( current_longitude ) - radians(?) ) + 
            sin( radians(?) ) * sin( radians( current_latitude ) ) ) ) AS distance
        ", [$latitude, $longitude, $latitude])
        ->whereRaw("
            ( 6371 * acos( cos( radians(?) ) * 
            cos( radians( current_latitude ) ) * cos( radians( current_longitude ) - radians(?) ) + 
            sin( radians(?) ) * sin( radians( current_latitude ) ) ) ) < ?
        ", [$latitude, $longitude, $latitude, $radius])
        ->orderBy('distance');
    }

    /**
     * Helper methods
     */
    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function goOnline(): void
    {
        $this->update(['is_online' => true]);
    }

    public function goOffline(): void
    {
        $this->update(['is_online' => false]);
    }

    public function updateLocation(float $latitude, float $longitude): void
    {
        $this->update([
            'current_latitude' => $latitude,
            'current_longitude' => $longitude,
        ]);
    }

    public function addEarnings(float $amount): void
    {
        $this->increment('earnings_today', $amount);
        $this->increment('total_earnings', $amount);
    }

    public function resetDailyEarnings(): void
    {
        $this->update(['earnings_today' => 0]);
    }
}