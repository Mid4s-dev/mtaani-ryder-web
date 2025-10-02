<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');

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
                           ->paginate(20);

        return Inertia::render('deliveries/index', [
            'auth' => ['user' => $user],
            'deliveries' => $deliveries,
            'status' => $status,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $delivery = Delivery::with(['customer', 'rider', 'trackingUpdates'])
                           ->findOrFail($id);

        // Check if user has access to this delivery
        if (!in_array($user->id, [$delivery->customer_id, $delivery->rider_id]) && !$user->isAdmin()) {
            abort(403, 'Unauthorized access to this delivery');
        }

        return Inertia::render('deliveries/show', [
            'auth' => ['user' => $user],
            'delivery' => $delivery,
            'current_location' => $delivery->rider?->riderProfile ? [
                'latitude' => $delivery->rider->riderProfile->current_latitude,
                'longitude' => $delivery->rider->riderProfile->current_longitude,
            ] : null,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        return Inertia::render('deliveries/create', [
            'auth' => ['user' => $user],
        ]);
    }
}