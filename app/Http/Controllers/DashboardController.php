<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $data = ['auth' => ['user' => $user]];

        if ($user->isRider() && $user->riderProfile) {
            // Get rider dashboard data
            $riderProfile = $user->riderProfile;
            
            // Active delivery
            $activeDelivery = $user->riderDeliveries()
                                  ->active()
                                  ->with(['customer'])
                                  ->first();

            // Today's stats
            $todayDeliveries = $user->riderDeliveries()
                                   ->whereDate('created_at', today())
                                   ->get();

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

            $data['stats'] = $stats;
            $data['active_delivery'] = $activeDelivery;

        } elseif ($user->isAdmin()) {
            // Get admin dashboard data - redirect to enhanced admin dashboard
            return redirect()->route('admin.dashboard');
        } else {
            // Customer dashboard data
            $customerDeliveries = $user->customerDeliveries()
                                      ->with(['rider'])
                                      ->orderBy('created_at', 'desc')
                                      ->limit(5)
                                      ->get();

            $stats = [
                'total_deliveries' => $user->customerDeliveries()->count(),
                'completed_deliveries' => $user->customerDeliveries()->where('status', 'delivered')->count(),
                'pending_deliveries' => $user->customerDeliveries()->where('status', 'pending')->count(),
                'in_transit_deliveries' => $user->customerDeliveries()->whereIn('status', ['accepted', 'picked_up', 'in_transit'])->count(),
            ];

            $data['stats'] = $stats;
            $data['recent_deliveries'] = $customerDeliveries;
        }

        return Inertia::render('dashboard', $data);
    }
}