<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsRider
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        if (!$user || $user->user_type !== 'rider') {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            return redirect()->route('dashboard')->with('error', 'You must be a rider to access this area.');
        }

        return $next($request);
    }
}