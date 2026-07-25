<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Commission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Commission::with(['sale.captacion', 'seller']);

        if ($user->role !== 'admin') {
            $query->where('seller_id', $user->id);
        }

        $commissions = $query->orderBy('created_at', 'desc')->get();
        return response()->json($commissions);
    }

    public function stats(Request $request)
    {
        $user = $request->user();

        // 1. Total de comisiones por vendedor (para administrador) o total propio (para vendedor)
        if ($user->role === 'admin') {
            $totalPerSeller = User::where('role', 'seller')
                ->withSum('commissions', 'amount')
                ->get()
                ->map(function ($u) {
                    return [
                        'seller_id' => $u->id,
                        'username' => $u->username,
                        'total_commission' => $u->commissions_sum_amount ?? 0.00
                    ];
                });
        } else {
            $totalPerSeller = [
                [
                    'seller_id' => $user->id,
                    'username' => $user->username,
                    'total_commission' => Commission::where('seller_id', $user->id)->sum('amount')
                ]
            ];
        }

        // 2. Historial mensual de comisiones (últimos 6 meses)
        $monthlyQuery = Commission::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(amount) as total_amount')
            );

        if ($user->role !== 'admin') {
            $monthlyQuery->where('seller_id', $user->id);
        }

        $monthlyHistory = $monthlyQuery->groupBy('month')
            ->orderBy('month', 'asc')
            ->take(6)
            ->get();

        return response()->json([
            'total_per_seller' => $totalPerSeller,
            'monthly_history' => $monthlyHistory
        ]);
    }
}
