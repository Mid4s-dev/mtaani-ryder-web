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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('user_type', ['customer', 'rider', 'admin'])->default('customer');
            $table->string('phone')->nullable();
            $table->boolean('phone_verified')->default(false);
            $table->string('avatar')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('total_ratings')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_active_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'user_type',
                'phone',
                'phone_verified',
                'avatar',
                'rating',
                'total_ratings',
                'is_active',
                'last_active_at'
            ]);
        });
    }
};