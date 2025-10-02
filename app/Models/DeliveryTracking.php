<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryTracking extends Model
{
    use HasFactory;

    protected $table = 'delivery_tracking';

    protected $fillable = [
        'delivery_id',
        'latitude',
        'longitude',
        'status',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Relationships
     */
    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }
}