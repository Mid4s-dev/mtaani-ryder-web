<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_code',
        'customer_id',
        'rider_id',
        'preferred_riders',
        'rejected_by_riders',
        'customer_can_choose_rider',
        'rider_selection_expires_at',
        'assignment_type',
        'repeat_customer',
        'pickup_name',
        'pickup_phone',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
        'pickup_notes',
        'delivery_name',
        'delivery_phone',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'delivery_notes',
        'package_type',
        'package_description',
        'package_weight',
        'package_size',
        'package_photos',
        'distance',
        'base_fare',
        'distance_fare',
        'total_fare',
        'rider_earnings',
        'platform_fee',
        'payment_method',
        'payment_status',
        'status',
        'accepted_at',
        'picked_up_at',
        'delivered_at',
        'cancelled_at',
        'cancellation_reason',
        'customer_rating',
        'customer_review',
        'rider_rating',
        'rider_review',
    ];

    protected $casts = [
        'package_photos' => 'array',
        'preferred_riders' => 'array',
        'rejected_by_riders' => 'array',
        'customer_can_choose_rider' => 'boolean',
        'repeat_customer' => 'boolean',
        'pickup_latitude' => 'decimal:8',
        'pickup_longitude' => 'decimal:8',
        'delivery_latitude' => 'decimal:8',
        'delivery_longitude' => 'decimal:8',
        'distance' => 'decimal:2',
        'base_fare' => 'decimal:2',
        'distance_fare' => 'decimal:2',
        'total_fare' => 'decimal:2',
        'rider_earnings' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'package_weight' => 'decimal:2',
        'accepted_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'rider_selection_expires_at' => 'datetime',
    ];

    /**
     * Boot method to generate delivery code
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($delivery) {
            if (!$delivery->delivery_code) {
                $delivery->delivery_code = 'RYD' . strtoupper(Str::random(8));
            }
        });
    }

    /**
     * Relationships
     */
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function trackingUpdates()
    {
        return $this->hasMany(DeliveryTracking::class);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['accepted', 'picked_up', 'in_transit']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeForRider($query, $riderId)
    {
        return $query->where('rider_id', $riderId);
    }

    public function scopeForCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Helper methods
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['accepted', 'picked_up', 'in_transit']);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'delivered';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function accept($riderId): void
    {
        $this->update([
            'rider_id' => $riderId,
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        $this->addTrackingUpdate('accepted', 'Delivery accepted by rider');
    }

    public function markPickedUp(): void
    {
        $this->update([
            'status' => 'picked_up',
            'picked_up_at' => now(),
        ]);

        $this->addTrackingUpdate('picked_up', 'Package picked up');
    }

    public function markInTransit(): void
    {
        $this->update(['status' => 'in_transit']);
        $this->addTrackingUpdate('in_transit', 'Package in transit');
    }

    public function markDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'payment_status' => 'paid',
        ]);

        $this->addTrackingUpdate('delivered', 'Package delivered successfully');

        // Add earnings to rider
        if ($this->rider && $this->rider->riderProfile) {
            $this->rider->riderProfile->addEarnings($this->rider_earnings);
        }
    }

    public function cancel($reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        $this->addTrackingUpdate('cancelled', $reason ?: 'Delivery cancelled');
    }

    public function addTrackingUpdate(string $status, string $notes = null, float $latitude = null, float $longitude = null): void
    {
        $this->trackingUpdates()->create([
            'status' => $status,
            'notes' => $notes,
            'latitude' => $latitude ?: ($this->rider?->riderProfile?->current_latitude),
            'longitude' => $longitude ?: ($this->rider?->riderProfile?->current_longitude),
        ]);
    }

    public function calculateFare(): array
    {
        $baseFare = 100; // Base fare in your currency
        $perKmRate = 20; // Rate per kilometer
        $platformFeePercent = 0.15; // 15% platform fee
        
        $distanceFare = $this->distance * $perKmRate;
        $totalFare = $baseFare + $distanceFare;
        $platformFee = $totalFare * $platformFeePercent;
        $riderEarnings = $totalFare - $platformFee;

        return [
            'base_fare' => $baseFare,
            'distance_fare' => $distanceFare,
            'total_fare' => $totalFare,
            'platform_fee' => $platformFee,
            'rider_earnings' => $riderEarnings,
        ];
    }

    public function rateCustomer(int $rating, string $review = null): void
    {
        $this->update([
            'rider_rating' => $rating,
            'rider_review' => $review,
        ]);

        $this->customer->updateRating($rating);
    }

    public function rateRider(int $rating, string $review = null): void
    {
        $this->update([
            'customer_rating' => $rating,
            'customer_review' => $review,
        ]);

        if ($this->rider) {
            $this->rider->updateRating($rating);
        }
    }

    /**
     * Set preferred riders for this delivery
     */
    public function setPreferredRiders(array $riderIds): void
    {
        $this->update([
            'preferred_riders' => $riderIds,
            'assignment_type' => 'customer_selected',
            'rider_selection_expires_at' => now()->addMinutes(15), // 15 minutes to respond
        ]);
    }

    /**
     * Add a rider to the rejection list
     */
    public function addRiderRejection(int $riderId): void
    {
        $rejectedRiders = $this->rejected_by_riders ?? [];
        if (!in_array($riderId, $rejectedRiders)) {
            $rejectedRiders[] = $riderId;
            $this->update(['rejected_by_riders' => $rejectedRiders]);
        }
    }

    /**
     * Check if rider can accept this delivery
     */
    public function canRiderAccept(int $riderId): bool
    {
        // Check if rider is in rejection list
        $rejectedRiders = $this->rejected_by_riders ?? [];
        if (in_array($riderId, $rejectedRiders)) {
            return false;
        }

        // If customer selected specific riders, check if this rider is in the list
        if ($this->assignment_type === 'customer_selected' && $this->preferred_riders) {
            return in_array($riderId, $this->preferred_riders);
        }

        // Check if selection has expired
        if ($this->rider_selection_expires_at && now()->gt($this->rider_selection_expires_at)) {
            return false;
        }

        return true;
    }

    /**
     * Get customer's previous riders
     */
    public function getCustomerPreviousRiders(): \Illuminate\Support\Collection
    {
        return Delivery::where('customer_id', $this->customer_id)
                      ->where('status', 'delivered')
                      ->whereNotNull('rider_id')
                      ->where('id', '!=', $this->id)
                      ->with('rider')
                      ->get()
                      ->pluck('rider')
                      ->unique('id')
                      ->take(10);
    }

    /**
     * Reject delivery by rider
     */
    public function rejectByRider(int $riderId, string $reason = null): void
    {
        $this->addRiderRejection($riderId);
        $this->addTrackingUpdate('rejected', $reason ?: 'Delivery rejected by rider');

        // If all preferred riders have rejected, open to all riders
        if ($this->assignment_type === 'customer_selected' && $this->preferred_riders) {
            $remainingRiders = array_diff($this->preferred_riders, $this->rejected_by_riders ?? []);
            if (empty($remainingRiders)) {
                $this->update([
                    'assignment_type' => 'auto',
                    'rider_selection_expires_at' => null,
                ]);
            }
        }
    }

    /**
     * Check if delivery is available for a specific rider
     */
    public function isAvailableForRider(int $riderId): bool
    {
        return $this->isPending() && $this->canRiderAccept($riderId);
    }
}