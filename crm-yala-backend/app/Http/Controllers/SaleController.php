<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Commission;
use App\Models\Captacion;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreSaleRequest;
use Illuminate\Support\Facades\Gate;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        \Illuminate\Support\Facades\Log::info('SaleController@index called', [
            'user_id' => $user ? $user->id : null,
            'role' => $user ? $user->role : null,
            'query_params' => $request->all()
        ]);

        $query = Sale::with(['captacion.seller']);

        if ($user->role !== 'admin') {
            $query->whereHas('captacion', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            });
        }

        // Filtro por sistema
        if ($request->has('system') && $request->system != '' && !in_array($request->system, ['Todos los Sistemas', 'undefined', 'null'])) {
            $query->where('sold_system', $request->system);
        }

        // Filtro por fecha (rango)
        if ($request->has('start_date') && $request->start_date != '') {
            $query->where('sale_date', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date != '') {
            $query->where('sale_date', '<=', $request->end_date);
        }

        $sales = $query->orderBy('sale_date', 'desc')->get();
        return response()->json($sales);
    }

    public function store(StoreSaleRequest $request)
    {
        $validatedData = $request->validated();
        $captacion = Captacion::findOrFail($validatedData['captacion_id']);

        Gate::authorize('update', $captacion);

        // Evitar duplicados (una captación solo puede tener una venta registrada)
        $existingSale = Sale::where('captacion_id', $validatedData['captacion_id'])->first();
        if ($existingSale) {
            return response()->json(['message' => 'Esta captación ya tiene una venta registrada.'], 422);
        }

        $result = DB::transaction(function () use ($validatedData, $captacion) {
            $price = $validatedData['price'];
            $discount = $validatedData['discount'];
            $netPrice = $price - $discount;

            // Calcular porcentaje de comisión
            $discountPercent = $price > 0 ? ($discount / $price) * 100 : 0;
            
            if ($discountPercent == 0) {
                $commissionPercent = config('commissions.tiers.base', 15.0);
            } elseif ($discountPercent <= 10) {
                $commissionPercent = config('commissions.tiers.low_discount', 12.0);
            } else {
                $commissionPercent = config('commissions.tiers.high_discount', 8.5);
            }

            $commissionAmount = $netPrice * ($commissionPercent / 100);

            // 1. Registrar Venta
            $sale = Sale::create([
                'captacion_id' => $validatedData['captacion_id'],
                'sold_system' => $validatedData['sold_system'],
                'price' => $price,
                'discount' => $discount,
                'commission' => $commissionAmount,
                'sale_date' => $validatedData['sale_date'],
            ]);

            // 2. Registrar Comisión para el Vendedor
            $commission = Commission::create([
                'seller_id' => $captacion->seller_id,
                'sale_id' => $sale->id,
                'amount' => $commissionAmount
            ]);

            // 3. Cambiar estado de la captación a 'Closed Sale'
            $captacion->update(['status' => 'Closed Sale']);

            return compact('sale', 'commission');
        });

        return response()->json([
            'message' => 'Venta registrada y comisión calculada exitosamente.',
            'sale' => $result['sale'],
            'commission' => $result['commission']
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        Gate::authorize('delete', $sale);

        DB::transaction(function () use ($sale) {
            // Revertir el estado de la captación a 'Negotiation'
            $captacion = Captacion::find($sale->captacion_id);
            if ($captacion) {
                $captacion->update(['status' => 'Negotiation']);
            }

            // Eliminar venta (las comisiones se eliminan por cascade en BD)
            $sale->delete();
        });

        return response()->json([
            'message' => 'Venta eliminada y captación revertida a negociación.'
        ]);
    }
}
