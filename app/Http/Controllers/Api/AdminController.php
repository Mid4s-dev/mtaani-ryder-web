<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Delivery;
use App\Models\RiderProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function getDashboard(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        // Get comprehensive statistics
        $stats = [
            // User statistics
            'total_users' => User::count(),
            'active_users' => User::active()->count(),
            'customers' => User::customers()->count(),
            'riders' => User::riders()->count(),
            'admins' => User::admins()->count(),
            
            // Delivery statistics
            'total_deliveries' => Delivery::count(),
            'pending_deliveries' => Delivery::where('status', 'pending')->count(),
            'accepted_deliveries' => Delivery::where('status', 'accepted')->count(),
            'in_progress_deliveries' => Delivery::where('status', 'in_progress')->count(),
            'completed_deliveries' => Delivery::where('status', 'delivered')->count(),
            'cancelled_deliveries' => Delivery::where('status', 'cancelled')->count(),
            
            // Today's statistics
            'today_deliveries' => Delivery::whereDate('created_at', today())->count(),
            'today_earnings' => Delivery::whereDate('created_at', today())
                                      ->where('status', 'delivered')
                                      ->sum('platform_fee'),
            
            // Rider statistics
            'online_riders' => RiderProfile::where('is_online', true)->count(),
            'verified_riders' => RiderProfile::where('verification_status', 'verified')->count(),
            'pending_rider_verifications' => RiderProfile::where('verification_status', 'pending')->count(),
        ];

        // Get recent activity
        $recentDeliveries = Delivery::with(['customer', 'rider'])
                                  ->latest()
                                  ->limit(10)
                                  ->get();

        // Get revenue data for last 7 days
        $revenueData = Delivery::where('status', 'delivered')
                              ->where('created_at', '>=', now()->subDays(7))
                              ->selectRaw('DATE(created_at) as date, SUM(platform_fee) as revenue, COUNT(*) as count')
                              ->groupBy('date')
                              ->orderBy('date')
                              ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_deliveries' => $recentDeliveries,
                'revenue_data' => $revenueData,
            ],
        ]);
    }

    /**
     * Get live transactions
     */
    public function getLiveTransactions(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');

        $query = Delivery::with(['customer', 'rider'])
                        ->orderByDesc('created_at');

        if ($status) {
            $query->where('status', $status);
        }

        $transactions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Get user management data
     */
    public function getUserManagement(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        $perPage = $request->get('per_page', 15);
        $userType = $request->get('user_type');
        $status = $request->get('status');

        $query = User::with(['riderProfile']);

        if ($userType) {
            $query->where('user_type', $userType);
        }

        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $users = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Approve or reject user verification
     */
    public function updateUserVerification(Request $request, $userId)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetUser = User::findOrFail($userId);
        $action = $request->action;
        $reason = $request->reason;

        try {
            if ($targetUser->isRider() && $targetUser->riderProfile) {
                $status = $action === 'approve' ? 'verified' : 'rejected';
                $targetUser->riderProfile->update(['verification_status' => $status]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'User does not have a profile that can be verified',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => "User verification {$action}d successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user verification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ban or unban user
     */
    public function updateUserStatus(Request $request, $userId)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:ban,unban,activate,deactivate',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetUser = User::findOrFail($userId);
        $action = $request->action;

        // Prevent admin from banning themselves
        if ($targetUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot modify your own account status',
            ], 403);
        }

        try {
            $isActive = in_array($action, ['unban', 'activate']);
            $targetUser->update(['is_active' => $isActive]);

            return response()->json([
                'success' => true,
                'message' => "User {$action}ned successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get detailed user information
     */
    public function getUserDetails(Request $request, $userId)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        $targetUser = User::with(['riderProfile'])
                         ->findOrFail($userId);

        // Get user's delivery history
        $deliveryStats = [
            'as_customer' => $targetUser->customerDeliveries()->count(),
            'as_rider' => $targetUser->riderDeliveries()->count(),
        ];

        // Get recent deliveries
        $recentDeliveries = collect();
        
        if ($targetUser->isCustomer()) {
            $recentDeliveries = $targetUser->customerDeliveries()
                                          ->with(['rider'])
                                          ->latest()
                                          ->limit(5)
                                          ->get();
        } elseif ($targetUser->isRider()) {
            $recentDeliveries = $targetUser->riderDeliveries()
                                          ->with(['customer'])
                                          ->latest()
                                          ->limit(5)
                                          ->get();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $targetUser,
                'delivery_stats' => $deliveryStats,
                'recent_deliveries' => $recentDeliveries,
            ],
        ]);
    }

    /**
     * Get system analytics
     */
    public function getAnalytics(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        $days = $request->get('days', 30);

        // Revenue analytics
        $revenueAnalytics = DB::table('deliveries')
            ->where('status', 'delivered')
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as total_deliveries,
                SUM(total_fare) as gross_revenue,
                SUM(platform_fee) as net_revenue,
                AVG(total_fare) as avg_order_value
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // User growth analytics
        $userGrowth = DB::table('users')
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('
                DATE(created_at) as date,
                user_type,
                COUNT(*) as new_users
            ')
            ->groupBy('date', 'user_type')
            ->orderBy('date')
            ->get();

        // Performance metrics
        $performanceMetrics = [
            'avg_delivery_time' => DB::table('deliveries')
                ->where('status', 'delivered')
                ->where('created_at', '>=', now()->subDays($days))
                ->whereNotNull('accepted_at')
                ->whereNotNull('delivered_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, accepted_at, delivered_at)) as avg_minutes')
                ->value('avg_minutes'),
            
            'completion_rate' => $this->getCompletionRate($days),
            'cancellation_rate' => $this->getCancellationRate($days),
            'rider_utilization' => $this->getRiderUtilization($days),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'revenue_analytics' => $revenueAnalytics,
                'user_growth' => $userGrowth,
                'performance_metrics' => $performanceMetrics,
            ],
        ]);
    }

    /**
     * Helper method to calculate completion rate
     */
    private function getCompletionRate($days)
    {
        $totalDeliveries = Delivery::where('created_at', '>=', now()->subDays($days))->count();
        $completedDeliveries = Delivery::where('created_at', '>=', now()->subDays($days))
                                     ->where('status', 'delivered')
                                     ->count();

        return $totalDeliveries > 0 ? round(($completedDeliveries / $totalDeliveries) * 100, 2) : 0;
    }

    /**
     * Helper method to calculate cancellation rate
     */
    private function getCancellationRate($days)
    {
        $totalDeliveries = Delivery::where('created_at', '>=', now()->subDays($days))->count();
        $cancelledDeliveries = Delivery::where('created_at', '>=', now()->subDays($days))
                                     ->where('status', 'cancelled')
                                     ->count();

        return $totalDeliveries > 0 ? round(($cancelledDeliveries / $totalDeliveries) * 100, 2) : 0;
    }

    /**
     * Helper method to calculate rider utilization
     */
    private function getRiderUtilization($days)
    {
        $totalRiders = RiderProfile::where('verification_status', 'verified')->count();
        $activeRiders = DB::table('deliveries')
            ->where('created_at', '>=', now()->subDays($days))
            ->whereNotNull('rider_id')
            ->distinct('rider_id')
            ->count();

        return $totalRiders > 0 ? round(($activeRiders / $totalRiders) * 100, 2) : 0;
    }
}
