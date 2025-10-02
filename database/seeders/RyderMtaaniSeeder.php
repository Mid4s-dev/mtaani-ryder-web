<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\RiderProfile;
use App\Models\Delivery;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RyderMtaaniSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample customers
        $customer1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@customer.com',
            'phone' => '+254712345678',
            'password' => Hash::make('password'),
            'user_type' => 'customer',
            'phone_verified' => true,
            'is_active' => true,
            'rating' => 4.8,
            'total_ratings' => 25,
        ]);

        $customer2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@customer.com',
            'phone' => '+254798765432',
            'password' => Hash::make('password'),
            'user_type' => 'customer',
            'phone_verified' => true,
            'is_active' => true,
            'rating' => 4.6,
            'total_ratings' => 18,
        ]);

        // Create sample riders
        $rider1 = User::create([
            'name' => 'Peter Rider',
            'email' => 'peter@rider.com',
            'phone' => '+254723456789',
            'password' => Hash::make('password'),
            'user_type' => 'rider',
            'phone_verified' => true,
            'is_active' => true,
            'rating' => 4.9,
            'total_ratings' => 156,
        ]);

        $riderProfile1 = RiderProfile::create([
            'user_id' => $rider1->id,
            'vehicle_type' => 'motorbike',
            'vehicle_make' => 'Honda',
            'vehicle_model' => 'CB150R',
            'vehicle_plate' => 'KCA 123B',
            'verification_status' => 'verified',
            'is_online' => true,
            'current_latitude' => -1.2921,
            'current_longitude' => 36.8219,
            'delivery_radius' => 10,
            'earnings_today' => 2450.00,
            'total_earnings' => 45670.00,
        ]);

        $rider2 = User::create([
            'name' => 'Mary Walker',
            'email' => 'mary@rider.com',
            'phone' => '+254734567890',
            'password' => Hash::make('password'),
            'user_type' => 'rider',
            'phone_verified' => true,
            'is_active' => true,
            'rating' => 4.7,
            'total_ratings' => 89,
        ]);

        $riderProfile2 = RiderProfile::create([
            'user_id' => $rider2->id,
            'vehicle_type' => 'bicycle',
            'verification_status' => 'verified',
            'is_online' => false,
            'current_latitude' => -1.3197,
            'current_longitude' => 36.7076,
            'delivery_radius' => 5,
            'earnings_today' => 890.00,
            'total_earnings' => 23450.00,
        ]);

                // Create sample admin
        $admin1 = User::create([
            'name' => 'Administrator',
            'email' => 'admin@rydermtaani.com',
            'phone' => '+254700000000',
            'password' => Hash::make('password'),
            'user_type' => 'admin',
            'phone_verified' => true,
            'is_active' => true,
            'rating' => 5.0,
            'total_ratings' => 1,
        ]);

        // Create sample deliveries
        $deliveries = [
            [
                'customer_id' => $customer1->id,
                'rider_id' => $rider1->id,
                'pickup_name' => 'Michael Johnson',
                'pickup_phone' => '+254745678901',
                'pickup_address' => 'Westlands Shopping Mall, Ground Floor, Shop G12',
                'pickup_latitude' => -1.2630,
                'pickup_longitude' => 36.8063,
                'pickup_notes' => 'Shop is located at the main entrance',
                'delivery_name' => 'John Doe',
                'delivery_phone' => '+254712345678',
                'delivery_address' => 'Lavington, Green Park Apartments, Apt 4B',
                'delivery_latitude' => -1.2830,
                'delivery_longitude' => 36.7783,
                'delivery_notes' => 'Use the back entrance, apartment is on 4th floor',
                'package_type' => 'Electronics',
                'package_description' => 'Samsung Galaxy smartphone in original packaging',
                'package_weight' => 0.5,
                'package_size' => 'small',
                'distance' => 2.8,
                'base_fare' => 100,
                'distance_fare' => 56,
                'total_fare' => 156,
                'rider_earnings' => 132.60,
                'platform_fee' => 23.40,
                'payment_method' => 'mobile_money',
                'payment_status' => 'paid',
                'status' => 'delivered',
                'accepted_at' => now()->subHours(3),
                'picked_up_at' => now()->subHours(2.5),
                'delivered_at' => now()->subHours(2),
                'customer_rating' => 5,
                'customer_review' => 'Excellent service! Very professional rider.',
                'rider_rating' => 5,
                'rider_review' => 'Great customer, easy to locate.',
            ],
            [
                'customer_id' => $customer2->id,
                'rider_id' => $rider2->id,
                'pickup_name' => 'Dr. Sarah Mwangi',
                'pickup_phone' => '+254756789012',
                'pickup_address' => 'Karen Hardy Shopping Center, First Floor',
                'pickup_latitude' => -1.3197,
                'pickup_longitude' => 36.7076,
                'pickup_notes' => 'Pharmacy counter, ask for delivery package',
                'delivery_name' => 'Jane Smith',
                'delivery_phone' => '+254798765432',
                'delivery_address' => 'Karen, Bogani East Road, House Number 45',
                'delivery_latitude' => -1.3234,
                'delivery_longitude' => 36.7123,
                'delivery_notes' => 'Blue gate, ring the bell twice',
                'package_type' => 'Medical Supplies',
                'package_description' => 'Prescription medicines in sealed bag',
                'package_weight' => 0.2,
                'package_size' => 'small',
                'distance' => 1.5,
                'base_fare' => 100,
                'distance_fare' => 30,
                'total_fare' => 130,
                'rider_earnings' => 110.50,
                'platform_fee' => 19.50,
                'payment_method' => 'cash',
                'payment_status' => 'paid',
                'status' => 'delivered',
                'accepted_at' => now()->subHours(1.5),
                'picked_up_at' => now()->subHours(1.2),
                'delivered_at' => now()->subMinutes(30),
                'customer_rating' => 4,
                'customer_review' => 'Good service, medicines delivered safely.',
                'rider_rating' => 5,
                'rider_review' => 'Polite customer, clear directions.',
            ],
            [
                'customer_id' => $customer1->id,
                'pickup_name' => 'John Doe',
                'pickup_phone' => '+254712345678',
                'pickup_address' => 'Lavington, Green Park Apartments, Apt 4B',
                'pickup_latitude' => -1.2830,
                'pickup_longitude' => 36.7783,
                'pickup_notes' => 'Documents are with security guard',
                'delivery_name' => 'Corporate Office',
                'delivery_phone' => '+254700123456',
                'delivery_address' => 'Upper Hill, Britam Tower, 15th Floor',
                'delivery_latitude' => -1.2921,
                'delivery_longitude' => 36.8219,
                'delivery_notes' => 'Ask for Mr. Wilson at reception',
                'package_type' => 'Documents',
                'package_description' => 'Legal contracts in sealed envelope',
                'package_weight' => 0.1,
                'package_size' => 'small',
                'distance' => 3.2,
                'base_fare' => 100,
                'distance_fare' => 64,
                'total_fare' => 164,
                'rider_earnings' => 139.40,
                'platform_fee' => 24.60,
                'payment_method' => 'card',
                'payment_status' => 'pending',
                'status' => 'pending',
            ],
        ];

        foreach ($deliveries as $deliveryData) {
            Delivery::create($deliveryData);
        }

        $this->command->info('Ryder Mtaani sample data seeded successfully!');
        $this->command->info('Sample Login Credentials:');
        $this->command->info('Customer: john@customer.com / password');
        $this->command->info('Rider: peter@rider.com / password');
        $this->command->info('Admin: admin@rydermtaani.com / password');
    }
}