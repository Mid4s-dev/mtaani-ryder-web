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
        Schema::table('deliveries', function (Blueprint $table) {
            // Add rider selection and preference functionality
            $table->json('preferred_riders')->nullable()->after('rider_id');
            $table->json('rejected_by_riders')->nullable()->after('preferred_riders');
            $table->boolean('customer_can_choose_rider')->default(true)->after('rejected_by_riders');
            $table->timestamp('rider_selection_expires_at')->nullable()->after('customer_can_choose_rider');
            
            // Add delivery assignment type
            $table->enum('assignment_type', ['auto', 'customer_selected', 'specific_rider'])->default('auto')->after('rider_selection_expires_at');
            
            // Add previous delivery history reference
            $table->boolean('repeat_customer')->default(false)->after('assignment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn([
                'preferred_riders',
                'rejected_by_riders',
                'customer_can_choose_rider',
                'rider_selection_expires_at',
                'assignment_type',
                'repeat_customer'
            ]);
        });
    }
};
