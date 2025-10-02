<?php

namespace App\Http\Controllers;

use App\Models\RiderProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RiderController extends Controller
{
    /**
     * Show the rider profile page
     */
    public function profile()
    {
        $user = Auth::user();
        $riderProfile = RiderProfile::where('user_id', $user->id)->first();

        return Inertia::render('rider/Profile', [
            'user' => $user,
            'riderProfile' => $riderProfile,
        ]);
    }

    /**
     * Update rider profile information
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validatedData = $request->validate([
            'vehicle_type' => 'required|string|in:motorcycle,bicycle,car,truck,van',
            'license_number' => 'nullable|string|max:50',
            'id_number' => 'nullable|string|max:20',
            'alt_phone' => 'nullable|string|max:20',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'work_hours_start' => 'nullable|date_format:H:i',
            'work_hours_end' => 'nullable|date_format:H:i',
            'preferred_work_area' => 'nullable|string',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'account_name' => 'nullable|string|max:255',
            'mpesa_number' => 'nullable|string|max:20',
        ]);

        $riderProfile = RiderProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validatedData
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $riderProfile->fresh()
        ]);
    }

    /**
     * Toggle rider online status
     */
    public function toggleOnlineStatus(Request $request)
    {
        $user = Auth::user();
        
        $riderProfile = RiderProfile::where('user_id', $user->id)->first();
        
        if (!$riderProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Rider profile not found'
            ], 404);
        }

        $riderProfile->update([
            'is_online' => !$riderProfile->is_online,
            'last_seen' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => $riderProfile->is_online ? 'You are now online' : 'You are now offline',
            'data' => [
                'is_online' => $riderProfile->is_online
            ]
        ]);
    }

    /**
     * Update rider location
     */
    public function updateLocation(Request $request)
    {
        $user = Auth::user();
        
        $validatedData = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $riderProfile = RiderProfile::where('user_id', $user->id)->first();
        
        if (!$riderProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Rider profile not found'
            ], 404);
        }

        $riderProfile->update([
            'current_latitude' => $validatedData['latitude'],
            'current_longitude' => $validatedData['longitude'],
            'last_seen' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully'
        ]);
    }

    /**
     * Get rider earnings summary
     */
    public function getEarnings(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $period = $request->get('period', 'today');
        
        $query = $user->riderDeliveries()->where('status', 'delivered');
        
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
        }
        
        $deliveries = $query->get();
        
        $totalEarnings = $deliveries->sum('rider_fee');
        $deliveryCount = $deliveries->count();
        $averagePerDelivery = $deliveryCount > 0 ? $totalEarnings / $deliveryCount : 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'total_earnings' => $totalEarnings,
                'delivery_count' => $deliveryCount,
                'average_per_delivery' => $averagePerDelivery,
                'deliveries' => $deliveries->map(function ($delivery) {
                    return [
                        'id' => $delivery->id,
                        'delivery_code' => $delivery->delivery_code,
                        'rider_fee' => $delivery->rider_fee,
                        'delivered_at' => $delivery->delivered_at,
                        'pickup_address' => $delivery->pickup_address,
                        'dropoff_address' => $delivery->dropoff_address,
                    ];
                })
            ]
        ]);
    }
}