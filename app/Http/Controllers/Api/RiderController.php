<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RiderProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RiderController extends Controller
{
    /**
     * Complete rider profile setup
     */
    public function completeProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isRider()) {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can access this endpoint',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'license_number' => 'nullable|string|max:50',
            'vehicle_type' => 'required|in:foot,bicycle,motorbike,car',
            'vehicle_make' => 'nullable|string|max:100',
            'vehicle_model' => 'nullable|string|max:100',
            'vehicle_plate' => 'nullable|string|max:20|unique:rider_profiles,vehicle_plate,' . ($user->riderProfile?->id ?? 'null'),
            'documents' => 'nullable|array',
            'documents.*' => 'string',
            'delivery_radius' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $riderProfile = $user->riderProfile;
            
            if (!$riderProfile) {
                $riderProfile = $user->riderProfile()->create($request->all());
            } else {
                $riderProfile->update($request->all());
            }

            return response()->json([
                'success' => true,
                'message' => 'Rider profile updated successfully',
                'data' => [
                    'rider_profile' => $riderProfile,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update rider profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update rider online status
     */
    public function updateOnlineStatus(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isRider() || !$user->riderProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can access this endpoint',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_online' => 'required|boolean',
            'latitude' => 'required_if:is_online,true|nullable|numeric|between:-90,90',
            'longitude' => 'required_if:is_online,true|nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $riderProfile = $user->riderProfile;

        if (!$riderProfile->isVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Rider profile must be verified to go online',
            ], 403);
        }

        try {
            $isOnline = $request->is_online;
            
            if ($isOnline) {
                $riderProfile->update([
                    'is_online' => true,
                    'current_latitude' => $request->latitude,
                    'current_longitude' => $request->longitude,
                ]);
                $message = 'You are now online';
            } else {
                $riderProfile->goOffline();
                $message = 'You are now offline';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'rider_profile' => $riderProfile->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update online status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update rider location
     */
    public function updateLocation(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isRider() || !$user->riderProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can access this endpoint',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $riderProfile = $user->riderProfile;
            $riderProfile->updateLocation($request->latitude, $request->longitude);

            return response()->json([
                'success' => true,
                'message' => 'Location updated successfully',
                'data' => [
                    'location' => [
                        'latitude' => $request->latitude,
                        'longitude' => $request->longitude,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update location',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get rider dashboard data
     */
    public function getDashboard(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isRider() || !$user->riderProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can access this endpoint',
            ], 403);
        }

        $riderProfile = $user->riderProfile;
        
        // Get today's deliveries
        $todayDeliveries = $user->riderDeliveries()
                               ->whereDate('created_at', today())
                               ->get();

        // Get active delivery
        $activeDelivery = $user->riderDeliveries()
                              ->active()
                              ->with(['customer'])
                              ->first();

        // Calculate statistics
        $stats = [
            'total_deliveries' => $user->riderDeliveries()->completed()->count(),
            'today_deliveries' => $todayDeliveries->where('status', 'delivered')->count(),
            'today_earnings' => $riderProfile->earnings_today,
            'total_earnings' => $riderProfile->total_earnings,
            'rating' => $user->rating,
            'total_ratings' => $user->total_ratings,
            'is_online' => $riderProfile->is_online,
            'verification_status' => $riderProfile->verification_status,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'active_delivery' => $activeDelivery,
                'rider_profile' => $riderProfile,
            ],
        ]);
    }

    /**
     * Get rider earnings
     */
    public function getEarnings(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isRider()) {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can access this endpoint',
            ], 403);
        }

        $period = $request->query('period', 'week'); // day, week, month, year
        
        $query = $user->riderDeliveries()->completed();
        
        switch ($period) {
            case 'today':
                $query->whereDate('delivered_at', today());
                break;
            case 'week':
                $query->whereBetween('delivered_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('delivered_at', now()->month)
                      ->whereYear('delivered_at', now()->year);
                break;
            case 'year':
                $query->whereYear('delivered_at', now()->year);
                break;
        }
        
        $deliveries = $query->orderBy('delivered_at', 'desc')->get();
        
        $earnings = [
            'total_earnings' => $deliveries->sum('rider_earnings'),
            'total_deliveries' => $deliveries->count(),
            'average_per_delivery' => $deliveries->count() > 0 ? $deliveries->avg('rider_earnings') : 0,
            'deliveries' => $deliveries,
        ];

        return response()->json([
            'success' => true,
            'data' => $earnings,
        ]);
    }

    /**
     * Get nearby riders (for admin/debugging)
     */
    public function getNearbyRiders(Request $request)
    {
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

        $riders = RiderProfile::with('user')
                             ->verified()
                             ->online()
                             ->nearby($latitude, $longitude, $radius)
                             ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'riders' => $riders,
                'count' => $riders->count(),
            ],
        ]);
    }
}