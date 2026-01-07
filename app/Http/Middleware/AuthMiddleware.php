<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = session('auth_token');

        if (!$token) {
            return redirect()->route('login');
        }

        // Check if session exists in DB
        $session = DB::connection('mysql')->table('auth_sessions')
            ->where('token', $token)
            ->first();

        if (!$session) {
            session()->forget('auth_token');
            session()->forget('emp_data');
            return redirect()->route('login');
        }

        // Get role from admin table
        $adminData = DB::connection('mysql')->table('admin')
            ->where('emp_id', $session->emp_id)
            ->first();

        // Merge admin role with session data
        $empData = (array) $session;
        $empData['emp_role'] = $adminData->emp_role ?? null;

        // Save to session
        session(['emp_data' => $empData]);

        // Role-based access check
        $role = $empData['emp_role'];
        $empId = $empData['emp_id'];

        if (
            session('emp_data') &&
            !in_array(session('emp_data')['emp_dept'], ['Equipment Engineering']) &&
            !in_array(session('emp_data')['emp_role'], ['admin', 'superadmin', 'approver'])
        ) {
            // User is not authorized
            session()->forget('auth_token');
            session()->forget('emp_data');

            return redirect()->route('unauthorized');
        }


        return $next($request);
    }
}
