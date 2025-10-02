<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\RiderProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    /**
     * Create a new delivery request
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Pickup details
            'pickup_name' => 'required|string|max:255',
            'pickup_phone' => 'required|string|max:20',
            'pickup_address' => 'required|string',
            'pickup_latitude' => 'required|numeric|between:-90,90',
            'pickup_longitude' => 'required|numeric|between:-180,180',
            'pickup_notes' => 'nullable|string',
            
            // Delivery details
            'delivery_name' => 'required|string|max:255',
            'delivery_phone' => 'required|string|max:20',
            'delivery_address' => 'required|string',
            'delivery_latitude' => 'required|numeric|between:-90,90',
            'delivery_longitude' => 'required|numeric|between:-180,180',
            'delivery_notes' => 'nullable|string',
            
            // Package details
            'package_type' => 'required|string|max:100',
            'package_description' => 'required|string',
            'package_weight' => 'nullable|numeric|min:0',
            'package_size' => 'nullable|in:small,medium,large',
            'package_photos' => 'nullable|array',
            'package_photos.*' => 'string',
            
            // Payment
            'payment_method' => 'required|in:cash,card,mobile_money',
            
            // Rider selection
            'preferred_riders' => 'nullable|array|max:5',
            'preferred_riders.*' => 'integer|exists:users,id',
            'customer_can_choose_rider' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Calculate distance between pickup and delivery
            $distance = $this->calculateDistance(
                $request->pickup_latitude,
                $request->pickup_longitude,
                $request->delivery_latitude,
                $request->delivery_longitude
            );

            $delivery = new Delivery($request->all());
            $delivery->customer_id = $request->user()->id;
            $delivery->distance = $distance;
            
            // Calculate fare
            $fareDetails = $delivery->calculateFare();
            $delivery->fill($fareDetails);
            
            // Set rider selection preferences
            if ($request->has('preferred_riders') && !empty($request->preferred_riders)) {
                $delivery->preferred_riders = $request->preferred_riders;
                $delivery->assignment_type = 'customer_selected';
                $delivery->rider_selection_expires_at = now()->addMinutes(15);
            }
            
            // Check if customer has worked with any riders before
            $previousRiders = Delivery::where('customer_id', $request->user()->id)
                                    ->where('status', 'delivered')
                                    ->whereNotNull('rider_id')
                                    ->distinct()
                                    ->count('rider_id');
            
            $delivery->repeat_customer = $previousRiders > 0;
            
            $delivery->save();

            return response()->json([
                'success' => true,
                'message' => 'Delivery request created successfully',
                'data' => [
                    'delivery' => $delivery->load('customer'),
                    'estimated_riders' => $this->findNearbyRiders(
                        $request->pickup_latitude,
                        $request->pickup_longitude
                    )->count(),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create delivery request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get delivery details
     */
    public function show(Request $request, $id)
    {
        $delivery = Delivery::with(['customer', 'rider', 'trackingUpdates'])
                           ->find($id);

        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found',
            ], 404);
        }

        // Check if user has access to this delivery
        $user = $request->user();
        if (!in_array($user->id, [$delivery->customer_id, $delivery->rider_id]) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'delivery' => $delivery,
            ],
        ]);
    }

    /**
     * Get user's deliveries
     */
    public function getUserDeliveries(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 20);

        $query = collect();

        if ($user->isCustomer()) {
            $query = $user->customerDeliveries();
        } elseif ($user->isRider()) {
            $query = $user->riderDeliveries();
        } elseif ($user->isAdmin()) {
            // Admins can see all deliveries
            $query = Delivery::query();
        }

        if ($status) {
            $query = $query->where('status', $status);
        }

        $deliveries = $query->with(['customer', 'rider'])
                           ->orderBy('created_at', 'desc')
                           ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => [
                'deliveries' => $deliveries,
            ],
        ]);
    }

    /**
     * Get available deliveries for riders
     */
    public function getAvailableDeliveries(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isRider() || !$user->riderProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Only verified riders can access this endpoint',
            ], 403);
        }

        $riderProfile = $user->riderProfile;
        
        if (!$riderProfile->isVerified() || !$riderProfile->is_online) {
            return response()->json([
                'success' => false,
                'message' => 'Rider must be verified and online',
            ], 403);
        }

        $radius = $request->query('radius', $riderProfile->delivery_radius);
        $latitude = $riderProfile->current_latitude;
        $longitude = $riderProfile->current_longitude;

        if (!$latitude || !$longitude) {
            return response()->json([
                'success' => false,
                'message' => 'Rider location not available',
            ], 400);
        }

        // Find nearby pending deliveries
        $deliveries = Delivery::pending()
            ->with(['customer'])
            ->selectRaw("
                *, ( 6371 * acos( cos( radians(?) ) * 
                cos( radians( pickup_latitude ) ) * cos( radians( pickup_longitude ) - radians(?) ) + 
                sin( radians(?) ) * sin( radians( pickup_latitude ) ) ) ) AS distance_to_pickup
            ", [$latitude, $longitude, $latitude])
            ->whereRaw("
                ( 6371 * acos( cos( radians(?) ) * 
                cos( radians( pickup_latitude ) ) * cos( radians( pickup_longitude ) - radians(?) ) + 
                sin( radians(?) ) * sin( radians( pickup_latitude ) ) ) ) < ?
            ", [$latitude, $longitude, $latitude, $radius])
            ->orderBy('distance_to_pickup')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'deliveries' => $deliveries,
                'rider_location' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ],
            ],
        ]);
    }

    /**
     * Accept a delivery
     */
    public function acceptDelivery(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isRider()) {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can accept deliveries',
            ], 403);
        }

        $delivery = Delivery::find($id);
        
        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found',
            ], 404);
        }

        if (!$delivery->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery is no longer available',
            ], 400);
        }

        try {
            DB::transaction(function () use ($delivery, $user) {
                $delivery->accept($user->id);
            });

            return response()->json([
                'success' => true,
                'message' => 'Delivery accepted successfully',
                'data' => [
                    'delivery' => $delivery->load(['customer', 'rider']),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept delivery',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update delivery status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:picked_up,in_transit,delivered,cancelled',
            'notes' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'cancellation_reason' => 'required_if:status,cancelled|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $delivery = Delivery::find($id);
        
        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found',
            ], 404);
        }

        $user = $request->user();
        
        // Check authorization
        if ($delivery->rider_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this delivery',
            ], 403);
        }

        try {
            $status = $request->status;
            $notes = $request->notes;
            $latitude = $request->latitude;
            $longitude = $request->longitude;

            switch ($status) {
                case 'picked_up':
                    $delivery->markPickedUp();
                    break;
                    
                case 'in_transit':
                    $delivery->markInTransit();
                    break;
                    
                case 'delivered':
                    $delivery->markDelivered();
                    break;
                    
                case 'cancelled':
                    $delivery->cancel($request->cancellation_reason);
                    break;
            }

            // Add tracking update with location if provided
            if ($latitude && $longitude) {
                $delivery->addTrackingUpdate($status, $notes, $latitude, $longitude);
            } elseif ($notes) {
                $delivery->addTrackingUpdate($status, $notes);
            }

            return response()->json([
                'success' => true,
                'message' => 'Delivery status updated successfully',
                'data' => [
                    'delivery' => $delivery->load(['customer', 'rider', 'trackingUpdates']),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update delivery status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rate delivery
     */
    public function rateDelivery(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|between:1,5',
            'review' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $delivery = Delivery::find($id);
        
        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found',
            ], 404);
        }

        if (!$delivery->isCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Can only rate completed deliveries',
            ], 400);
        }

        $user = $request->user();
        
        try {
            if ($user->id === $delivery->customer_id) {
                // Customer rating rider
                if ($delivery->customer_rating) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You have already rated this delivery',
                    ], 400);
                }
                
                $delivery->rateRider($request->rating, $request->review);
                $message = 'Rider rated successfully';
                
            } elseif ($user->id === $delivery->rider_id) {
                // Rider rating customer
                if ($delivery->rider_rating) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You have already rated this delivery',
                    ], 400);
                }
                
                $delivery->rateCustomer($request->rating, $request->review);
                $message = 'Customer rated successfully';
                
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to rate this delivery',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'delivery' => $delivery->load(['customer', 'rider']),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to rate delivery',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get delivery tracking
     */
    public function getTracking(Request $request, $id)
    {
        $delivery = Delivery::with(['trackingUpdates' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])->find($id);

        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found',
            ], 404);
        }

        // Check authorization
        $user = $request->user();
        if (!in_array($user->id, [$delivery->customer_id, $delivery->rider_id]) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'delivery' => $delivery,
                'current_location' => $delivery->rider?->riderProfile ? [
                    'latitude' => $delivery->rider->riderProfile->current_latitude,
                    'longitude' => $delivery->rider->riderProfile->current_longitude,
                ] : null,
            ],
        ]);
    }

    /**
     * Calculate distance between two points
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // kilometers

        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    /**
     * Find nearby riders
     */
    private function findNearbyRiders($latitude, $longitude, $radius = 10)
    {
        return RiderProfile::verified()
                          ->online()
                          ->nearby($latitude, $longitude, $radius);
    }

    /**
     * Get available riders for customer selection
     */
    public function getAvailableRiders(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Only customers can access this endpoint',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $latitude = $request->latitude;
        $longitude = $request->longitude;
        $radius = $request->radius ?? 10;

        // Get nearby available riders
        $nearbyRiders = $this->findNearbyRiders($latitude, $longitude, $radius)
                            ->with('user')
                            ->get();

        // Get customer's previous riders
        $previousRiders = Delivery::where('customer_id', $user->id)
                                ->where('status', 'delivered')
                                ->whereNotNull('rider_id')
                                ->with(['rider.riderProfile'])
                                ->get()
                                ->pluck('rider')
                                ->unique('id')
                                ->take(10)
                                ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'nearby_riders' => $nearbyRiders,
                'previous_riders' => $previousRiders,
            ],
        ]);
    }

    /**
     * Select specific riders for a delivery
     */
    public function selectRiders(Request $request, $deliveryId)
    {
        $user = $request->user();
        
        $delivery = Delivery::findOrFail($deliveryId);

        if ($delivery->customer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only modify your own deliveries',
            ], 403);
        }

        if (!$delivery->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery is no longer pending',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'rider_ids' => 'required|array|min:1|max:5',
            'rider_ids.*' => 'integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $delivery->setPreferredRiders($request->rider_ids);

            return response()->json([
                'success' => true,
                'message' => 'Riders selected successfully',
                'data' => [
                    'delivery' => $delivery,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to select riders',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject delivery (for riders)
     */
    public function rejectDelivery(Request $request, $deliveryId)
    {
        $user = $request->user();
        
        if (!$user->isRider()) {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can reject deliveries',
            ], 403);
        }

        $delivery = Delivery::findOrFail($deliveryId);

        if (!$delivery->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery is not available for rejection',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $delivery->rejectByRider($user->id, $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Delivery rejected successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject delivery',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get deliveries available to a specific rider
     */
    public function getAvailableDeliveriesForRider(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isRider() || !$user->riderProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Only verified riders can access this endpoint',
            ], 403);
        }

        $riderProfile = $user->riderProfile;

        if (!$riderProfile->current_latitude || !$riderProfile->current_longitude) {
            return response()->json([
                'success' => false,
                'message' => 'Please update your location first',
            ], 400);
        }

        $radius = $riderProfile->delivery_radius ?? 10;

        // Get all pending deliveries within radius
        $availableDeliveries = Delivery::pending()
                                     ->with(['customer'])
                                     ->get()
                                     ->filter(function ($delivery) use ($user, $riderProfile, $radius) {
                                         // Check if rider can accept this delivery
                                         if (!$delivery->canRiderAccept($user->id)) {
                                             return false;
                                         }

                                         // Check distance
                                         $distance = $this->calculateDistance(
                                             $riderProfile->current_latitude,
                                             $riderProfile->current_longitude,
                                             $delivery->pickup_latitude,
                                             $delivery->pickup_longitude
                                         );

                                         return $distance <= $radius;
                                     })
                                     ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'available_deliveries' => $availableDeliveries,
            ],
        ]);
    }

    /**
     * Get customer's delivery history with riders
     */
    public function getCustomerRiderHistory(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Only customers can access this endpoint',
            ], 403);
        }

        // Get deliveries with riders that were completed
        $riderHistory = Delivery::where('customer_id', $user->id)
                              ->where('status', 'delivered')
                              ->whereNotNull('rider_id')
                              ->with(['rider.riderProfile'])
                              ->orderByDesc('delivered_at')
                              ->get()
                              ->groupBy('rider_id')
                              ->map(function ($deliveries, $riderId) {
                                  $rider = $deliveries->first()->rider;
                                  return [
                                      'rider' => $rider,
                                      'total_deliveries' => $deliveries->count(),
                                      'last_delivery' => $deliveries->first(),
                                      'avg_rating' => $deliveries->where('customer_rating', '>', 0)
                                                               ->avg('customer_rating'),
                                  ];
                              })
                              ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'rider_history' => $riderHistory,
            ],
        ]);
    }
}