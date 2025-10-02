<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'otp',
        'type',
        'verified',
        'expires_at',
    ];

    protected $casts = [
        'verified' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /**
     * Scopes
     */
    public function scopeValid($query)
    {
        return $query->where('verified', false)
                    ->where('expires_at', '>', now());
    }

    public function scopeForPhone($query, $phone)
    {
        return $query->where('phone', $phone);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Helper methods
     */
    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }

    public function isValid(): bool
    {
        return !$this->verified && !$this->isExpired();
    }

    public function markAsVerified(): void
    {
        $this->update(['verified' => true]);
    }

    /**
     * Generate OTP
     */
    public static function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create OTP verification
     */
    public static function createForPhone(string $phone, string $type = 'registration'): self
    {
        // Invalidate existing OTPs for this phone and type
        static::where('phone', $phone)
              ->where('type', $type)
              ->where('verified', false)
              ->update(['verified' => true]);

        return static::create([
            'phone' => $phone,
            'otp' => static::generateOtp(),
            'type' => $type,
            'expires_at' => now()->addMinutes(15),
        ]);
    }

    /**
     * Verify OTP
     */
    public static function verify(string $phone, string $otp, string $type = 'registration'): bool
    {
        $verification = static::forPhone($phone)
                             ->ofType($type)
                             ->valid()
                             ->where('otp', $otp)
                             ->first();

        if ($verification) {
            $verification->markAsVerified();
            return true;
        }

        return false;
    }
}