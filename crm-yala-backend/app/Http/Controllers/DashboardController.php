<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Captacion;
use App\Models\Sale;
use App\Models\Commission;
use App\Models\Visit;
use App\Models\Followup;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return $this->getAdminDashboard();
        } else {
            return $this->getSellerDashboard($user);
        }
    }

    private function getAdminDashboard()
    {
        // 1. Métricas Totales
        $totalCaptaciones = Captacion::count();
        $totalSalesCount = Sale::count();
        
        // Revenue = Suma de (precio - descuento)
        $revenue = Sale::select(DB::raw('SUM(price - discount) as total'))->first()->total ?? 0.00;
        
        // Tasa de conversión
        $conversionRate = $totalCaptaciones > 0 ? round(($totalSalesCount / $totalCaptaciones) * 100, 2) : 0;
        
        $totalCommissions = Commission::sum('amount');

        // 2. Ranking de Vendedores (Por volumen de ventas)
        $ranking = User::where('role', 'seller')
            ->select('users.id', 'users.username')
            ->withSum(['captaciones as sales_sum' => function ($query) {
                $query->join('sales', 'captaciones.id', '=', 'sales.captacion_id');
                $query->select(DB::raw('SUM(sales.price - sales.discount)'));
            }], '')
            ->withCount(['captaciones as sales_count' => function ($query) {
                $query->join('sales', 'captaciones.id', '=', 'sales.captacion_id');
            }])
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'username' => $u->username,
                    'sales_count' => $u->sales_count,
                    'sales_sum' => $u->sales_sum ?? 0.00
                ];
            })
            ->sortByDesc('sales_sum')
            ->values()
            ->all();

        // 3. Estadísticas Mensuales de Ventas (últimos 6 meses)
        $monthlyStats = Sale::select(
                DB::raw("DATE_FORMAT(sale_date, '%Y-%m') as month"),
                DB::raw('COUNT(*) as sales_count'),
                DB::raw('SUM(price - discount) as revenue')
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->take(6)
            ->get();

        // 4. Actividad Reciente (Últimas 5 visitas, seguimientos y captaciones combinados)
        $recentVisits = Visit::with(['captacion', 'seller'])
            ->orderBy('visit_date', 'desc')
            ->take(3)
            ->get()
            ->map(function ($v) {
                return [
                    'type' => 'visit',
                    'date' => $v->visit_date,
                    'title' => 'Visita a ' . $v->captacion->business_name,
                    'description' => $v->result,
                    'user' => $v->seller->username
                ];
            });

        $recentFollowups = Followup::with(['captacion.seller'])
            ->orderBy('date', 'desc')
            ->take(3)
            ->get()
            ->map(function ($f) {
                return [
                    'type' => 'followup',
                    'date' => $f->date,
                    'title' => 'Seguimiento a ' . $f->captacion->business_name,
                    'description' => $f->notes,
                    'user' => $f->captacion->seller->username
                ];
            });

        $recentCapturas = Captacion::with('seller')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($c) {
                return [
                    'type' => 'captacion',
                    'date' => $c->created_at->toDateTimeString(),
                    'title' => ($c->licensing_type === null) ? 'Captación Rápida: ' . $c->business_name : 'Nueva Captación: ' . $c->business_name,
                    'description' => $c->notes ?: 'Sin notas comerciales',
                    'user' => $c->seller ? $c->seller->username : 'Sistema'
                ];
            });

        $activities = $recentVisits->concat($recentFollowups)->concat($recentCapturas)
            ->sortByDesc('date')
            ->values()
            ->take(5)
            ->all();

        return response()->json([
            'metrics' => [
                'total_captaciones' => $totalCaptaciones,
                'total_sales' => $totalSalesCount,
                'revenue' => $revenue,
                'conversion_rate' => $conversionRate,
                'total_commissions' => $totalCommissions
            ],
            'ranking' => $ranking,
            'monthly_stats' => $monthlyStats,
            'activities' => $activities
        ]);
    }

    private function getSellerDashboard($user)
    {
        // 1. Métricas Propias
        $myCaptacionesCount = Captacion::where('seller_id', $user->id)->count();
        
        $mySalesQuery = Sale::whereHas('captacion', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        });
        
        $mySalesCount = $mySalesQuery->count();
        $myCommissionsSum = Commission::where('seller_id', $user->id)->sum('amount');
        
        // Conversión propia
        $conversionRate = $myCaptacionesCount > 0 ? round(($mySalesCount / $myCaptacionesCount) * 100, 2) : 0;

        // 2. Seguimientos Pendientes (Hoy y futuros)
        $pendingFollowups = Followup::whereHas('captacion', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })
            ->where(function ($q) {
                $q->whereDate('next_contact', '>=', now()->toDateString())
                  ->orWhereNull('result');
            })
            ->with('captacion')
            ->orderBy('next_contact', 'asc')
            ->take(5)
            ->get();

        // 3. Próximas Visitas (Hoy en adelante)
        $upcomingVisits = Visit::where('seller_id', $user->id)
            ->whereDate('visit_date', '>=', now()->toDateString())
            ->with('captacion')
            ->orderBy('visit_date', 'asc')
            ->take(5)
            ->get();

        // 4. Meta Semanal (Ejemplo: Captar 20 negocios por semana)
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        
        $weeklyCapturesCount = Captacion::where('seller_id', $user->id)
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->count();
            
        $weeklyGoal = 20; // Meta fija de 20 captaciones semanales
        $weeklyGoalCompletion = $weeklyGoal > 0 ? round(($weeklyCapturesCount / $weeklyGoal) * 100, 2) : 0;
        
        if ($weeklyGoalCompletion > 100) {
            $weeklyGoalCompletion = 100;
        }

        return response()->json([
            'metrics' => [
                'my_captaciones' => $myCaptacionesCount,
                'my_sales' => $mySalesCount,
                'my_commission' => $myCommissionsSum,
                'conversion_rate' => $conversionRate,
                'weekly_captures' => $weeklyCapturesCount,
                'weekly_goal' => $weeklyGoal,
                'weekly_goal_completion' => $weeklyGoalCompletion
            ],
            'pending_followups' => $pendingFollowups,
            'upcoming_visits' => $upcomingVisits
        ]);
    }
}
