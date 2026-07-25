<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Throttle database writes: only update if last_seen is null or older than 1 minute
            if (!$user->last_seen || \Illuminate\Support\Carbon::parse($user->last_seen)->lt(\Illuminate\Support\Carbon::now()->subMinute())) {
                $user->last_seen = \Illuminate\Support\Carbon::now();
                $user->save();
            }
        }

        return $next($request);
    }
}
