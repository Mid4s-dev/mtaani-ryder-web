<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('delivery_code')->unique();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('rider_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('business_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Pickup details
            $table->string('pickup_name');
            $table->string('pickup_phone');
            $table->text('pickup_address');
            $table->decimal('pickup_latitude', 10, 8);
            $table->decimal('pickup_longitude', 11, 8);
            $table->text('pickup_notes')->nullable();
            
            // Delivery details
            $table->string('delivery_name');
            $table->string('delivery_phone');
            $table->text('delivery_address');
            $table->decimal('delivery_latitude', 10, 8);
            $table->decimal('delivery_longitude', 11, 8);
            $table->text('delivery_notes')->nullable();
            
            // Package details
            $table->string('package_type');
            $table->text('package_description');
            $table->decimal('package_weight', 8, 2)->nullable();
            $table->string('package_size')->nullable(); // small, medium, large
            $table->json('package_photos')->nullable();
            
            // Pricing and payment
            $table->decimal('distance', 8, 2); // in kilometers
            $table->decimal('base_fare', 10, 2);
            $table->decimal('distance_fare', 10, 2);
            $table->decimal('total_fare', 10, 2);
            $table->decimal('rider_earnings', 10, 2)->nullable();
            $table->decimal('platform_fee', 10, 2)->nullable();
            $table->enum('payment_method', ['cash', 'card', 'mobile_money'])->default('cash');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            
            // Status and timing
            $table->enum('status', [
                'pending', 'accepted', 'picked_up', 'in_transit', 
                'delivered', 'cancelled', 'failed'
            ])->default('pending');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            // Ratings
            $table->integer('customer_rating')->nullable();
            $table->text('customer_review')->nullable();
            $table->integer('rider_rating')->nullable();
            $table->text('rider_review')->nullable();
            
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['rider_id', 'status']);
            $table->index(['customer_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};