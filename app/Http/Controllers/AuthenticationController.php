<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthenticationController extends Controller
{
    /**
     * Handle login and set custom session
     */
    public function setSession(Request $request)
    {
        $request->validate([
            'employeeID' => 'required|string',
            'password' => 'required|string',
        ]);

        // Attempt login using Laravel Auth
        if (!Auth::attempt([
            'employeeID' => $request->employeeID,
            'password' => $request->password
        ])) {
            return back()->withErrors(['general' => 'Invalid credentials'])->withInput();
        }

        // Successful login
        $request->session()->regenerate();

        $currentUser = Auth::user();

        // Optional: Get role from masterlist.admin table
        $isAdmin = DB::connection('mysql')->table('admin')
            ->where('emp_id', $currentUser->employeeID)
            ->first();

        // Set custom session
        session([
            'emp_data' => [
                'emp_id' => $currentUser->employeeID,
                'emp_name' => $currentUser->name,
                'emp_firstname' => $currentUser->name, // adjust if separate firstname
                'emp_jobtitle' => $currentUser->job_title ?? null,
                'emp_dept' => $currentUser->department ?? null,
                'emp_prodline' => $currentUser->prod_line ?? null,
                'emp_station' => $currentUser->station ?? null,
                'generated_at' => now()->toDateTimeString(),
                'emp_role' => $isAdmin->emp_role ?? null,
            ]
        ]);

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Handle logout
     */
    // public function logout(Request $request)
    // {
    //     // Kunin ang emp_id bago i-flush ang session
    //     $empId = session('emp_data.emp_id') ?? null;

    //     // Laravel logout
    //     Auth::guard('web')->logout();

    //     // Tanggalin lahat ng session data
    //     $request->session()->flush();
    //     $request->session()->invalidate();
    //     $request->session()->regenerateToken();

    //     // DELETE lahat ng sessions ng user sa auth_sessions table
    //     if ($empId) {
    //         DB::connection('mysql')->table('auth_sessions')
    //             ->where('emp_id', $empId)
    //             ->delete();
    //     }



    //     return redirect()->route('login');
    // }

    public function logout(Request $request)
    {
        // Kunin ang emp_id bago i-invalidate ang session
        $empId = session('emp_data.emp_id') ?? null;

        // Laravel auth logout
        Auth::guard('web')->logout();

        // Invalidate session safely
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Delete ALL sessions ng user
        if ($empId) {
            DB::table('auth_sessions')
                ->where('emp_id', $empId)
                ->delete();
        }

        // Cleanup expired sessions (older than 3 hours)
        // DB::table('auth_sessions')
        //     ->where('generated_at', '<', now()->subHours(3))
        //     ->delete();

        return redirect()->route('login');
    }
}
