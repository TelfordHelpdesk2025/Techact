<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $token = session('auth_token');

        $session = DB::connection('mysql')->table('auth_sessions')
            ->where('token', $token)
            ->first();

        if (!$session) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
