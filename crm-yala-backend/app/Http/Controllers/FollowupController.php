<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Followup;
use App\Models\Captacion;

class FollowupController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        \Illuminate\Support\Facades\Log::info('FollowupController@index called', [
            'user_id' => $user ? $user->id : null,
            'role' => $user ? $user->role : null,
            'query_params' => $request->all()
        ]);

        $query = Followup::with('captacion');

        if ($user->role !== 'admin') {
            $query->whereHas('captacion', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            });
        }

        if ($request->has('captacion_id') && $request->captacion_id != '' && !in_array($request->captacion_id, ['undefined', 'null'])) {
            $captacion = Captacion::find($request->captacion_id);
            if ($captacion && $user->role !== 'admin' && $captacion->seller_id !== $user->id) {
                return response()->json(['message' => 'Acción no autorizada.'], 403);
            }
            $query->where('captacion_id', $request->captacion_id);
        }

        // Si es timeline general o por captación
        $followups = $query->orderBy('date', 'desc')->get();
        return response()->json($followups);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'captacion_id' => 'required|exists:captaciones,id',
            'date' => 'required|date',
            'notes' => 'required|string',
            'next_contact' => 'nullable|date',
            'result' => 'nullable|string',
            'status' => 'nullable|string|in:pending,rescheduled,completed',
        ]);

        $captacion = Captacion::find($request->captacion_id);

        if ($user->role !== 'admin' && $captacion->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $followup = Followup::create([
            'captacion_id' => $request->captacion_id,
            'date' => $request->date,
            'notes' => $request->notes,
            'next_contact' => $request->next_contact,
            'result' => $request->result,
            'status' => $request->status ?? 'pending',
        ]);

        // Si el estado de la captación cambia o si tiene próxima fecha de contacto
        if ($request->has('result') && $request->result != '') {
            // Se puede actualizar el estado si el resultado amerita
        }

        return response()->json([
            'message' => 'Seguimiento registrado exitosamente.',
            'followup' => $followup
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $followup = Followup::find($id);

        if (!$followup) {
            return response()->json(['message' => 'Seguimiento no encontrado.'], 404);
        }

        $captacion = Captacion::find($followup->captacion_id);

        if ($user->role !== 'admin' && $captacion->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $request->validate([
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
            'next_contact' => 'nullable|date',
            'result' => 'nullable|string',
            'status' => 'nullable|string|in:pending,rescheduled,completed',
        ]);

        $followup->update($request->only([
            'date',
            'notes',
            'next_contact',
            'result',
            'status'
        ]));

        return response()->json([
            'message' => 'Seguimiento actualizado exitosamente.',
            'followup' => $followup
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $followup = Followup::find($id);

        if (!$followup) {
            return response()->json(['message' => 'Seguimiento no encontrado.'], 404);
        }

        $captacion = Captacion::find($followup->captacion_id);

        if ($user->role !== 'admin' && $captacion->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $followup->delete();

        return response()->json([
            'message' => 'Seguimiento eliminado exitosamente.'
        ]);
    }
}
