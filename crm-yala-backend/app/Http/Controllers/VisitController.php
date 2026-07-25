<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visit;
use App\Models\Captacion;

class VisitController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Visit::with(['captacion', 'seller']);

        if ($user->role !== 'admin') {
            $query->where('seller_id', $user->id);
        }

        if ($request->has('captacion_id') && $request->captacion_id != '' && !in_array($request->captacion_id, ['undefined', 'null'])) {
            $captacion = Captacion::find($request->captacion_id);
            if ($captacion && $user->role !== 'admin' && $captacion->seller_id !== $user->id) {
                return response()->json(['message' => 'Acción no autorizada.'], 403);
            }
            $query->where('captacion_id', $request->captacion_id);
        }

        $visits = $query->orderBy('visit_date', 'desc')->get();
        return response()->json($visits);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'captacion_id' => 'required|exists:captaciones,id',
            'visit_date' => 'required|date',
            'result' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $captacion = Captacion::find($request->captacion_id);

        if ($user->role !== 'admin' && $captacion->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $visit = Visit::create([
            'captacion_id' => $request->captacion_id,
            'seller_id' => $user->id,
            'visit_date' => $request->visit_date,
            'result' => $request->result,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Visita registrada exitosamente.',
            'visit' => $visit
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $visit = Visit::find($id);

        if (!$visit) {
            return response()->json(['message' => 'Visita no encontrada.'], 404);
        }

        if ($user->role !== 'admin' && $visit->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $visit->delete();

        return response()->json([
            'message' => 'Visita eliminada exitosamente.'
        ]);
    }
}
