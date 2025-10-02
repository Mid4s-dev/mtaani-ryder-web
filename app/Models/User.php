<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'phone',
        'phone_verified',
        'avatar',
        'rating',
        'total_ratings',
        'is_active',
        'last_active_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'phone_verified' => 'boolean',
            'is_active' => 'boolean',
            'last_active_at' => 'datetime',
            'rating' => 'decimal:2',
        ];
    }

    /**
     * Relationships
     */
    public function riderProfile()
    {
        return $this->hasOne(RiderProfile::class);
    }

    public function customerDeliveries()
    {
        return $this->hasMany(Delivery::class, 'customer_id');
    }

    public function riderDeliveries()
    {
        return $this->hasMany(Delivery::class, 'rider_id');
    }

    /**
     * Scopes
     */
    public function scopeRiders($query)
    {
        return $query->where('user_type', 'rider');
    }

    public function scopeCustomers($query)
    {
        return $query->where('user_type', 'customer');
    }

    public function scopeAdmins($query)
    {
        return $query->where('user_type', 'admin');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Helper methods
     */
    public function isRider(): bool
    {
        return $this->user_type === 'rider';
    }

    public function isCustomer(): bool
    {
        return $this->user_type === 'customer';
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    public function updateRating(int $newRating): void
    {
        $totalRatings = $this->total_ratings;
        $currentRating = $this->rating;
        
        $newTotalRatings = $totalRatings + 1;
        $newAverageRating = (($currentRating * $totalRatings) + $newRating) / $newTotalRatings;
        
        $this->update([
            'rating' => round($newAverageRating, 2),
            'total_ratings' => $newTotalRatings,
        ]);
    }
}
