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
        Schema::table('rider_profiles', function (Blueprint $table) {
            // Add ID number field (optional)
            $table->string('id_number')->nullable()->after('user_id');
            
            // Add additional phone number (optional)
            $table->string('alt_phone')->nullable()->after('id_number');
            
            // Add emergency contact info
            $table->string('emergency_contact_name')->nullable()->after('alt_phone');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            
            // Add work preferences
            $table->json('work_hours')->nullable()->after('delivery_radius');
            $table->json('preferred_areas')->nullable()->after('work_hours');
            
            // Add additional verification fields
            $table->string('bank_account_number')->nullable()->after('documents');
            $table->string('bank_name')->nullable()->after('bank_account_number');
            
            // Add profile completion status
            $table->boolean('profile_completed')->default(false)->after('verification_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rider_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'id_number',
                'alt_phone',
                'emergency_contact_name',
                'emergency_contact_phone',
                'work_hours',
                'preferred_areas',
                'bank_account_number',
                'bank_name',
                'profile_completed'
            ]);
        });
    }
};
