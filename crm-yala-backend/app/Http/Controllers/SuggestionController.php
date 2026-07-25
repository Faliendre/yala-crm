<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Suggestion;
use App\Models\Captacion;

class SuggestionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'captacion_id' => 'required|exists:captaciones,id'
        ]);

        $captacion = Captacion::find($request->captacion_id);
        if ($user->role !== 'admin' && $captacion->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $suggestions = Suggestion::where('captacion_id', $request->captacion_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($suggestions);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'captacion_id' => 'required|exists:captaciones,id',
            'description' => 'required|string'
        ]);

        $captacion = Captacion::find($request->captacion_id);

        if ($user->role !== 'admin' && $captacion->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $suggestion = Suggestion::create([
            'captacion_id' => $request->captacion_id,
            'description' => $request->description
        ]);

        return response()->json([
            'message' => 'Sugerencia agregada exitosamente.',
            'suggestion' => $suggestion
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $suggestion = Suggestion::find($id);

        if (!$suggestion) {
            return response()->json(['message' => 'Sugerencia no encontrada.'], 404);
        }

        $captacion = Captacion::find($suggestion->captacion_id);

        if ($user->role !== 'admin' && $captacion->seller_id !== $user->id) {
            return response()->json(['message' => 'Acción no autorizada.'], 403);
        }

        $suggestion->delete();

        return response()->json([
            'message' => 'Sugerencia eliminada exitosamente.'
        ]);
    }
}
