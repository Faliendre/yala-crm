<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Captacion;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreCaptacionRequest;
use App\Http\Requests\UpdateCaptacionRequest;
use Illuminate\Support\Facades\Gate;

class CaptacionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        \Illuminate\Support\Facades\Log::info('CaptacionController@index called', [
            'user_id' => $user ? $user->id : null,
            'role' => $user ? $user->role : null,
            'query_params' => $request->all()
        ]);

        // Empezar query
        $query = Captacion::with('seller');

        // Restringir a vendedor si no es admin
        if ($user->role !== 'admin') {
            $query->where('seller_id', $user->id);
        } elseif ($request->has('seller_id') && $request->seller_id != '' && !in_array($request->seller_id, ['Vendedor Asignado', 'undefined', 'null'])) {
            // Admin filtrando por vendedor
            $query->where('seller_id', $request->seller_id);
        }

        // Búsqueda por nombre de negocio
        if ($request->has('search') && $request->search != '') {
            $query->where('business_name', 'like', '%' . $request->search . '%');
        }

        // Filtro por estado
        if ($request->has('status') && $request->status != '' && !in_array($request->status, ['Todos los Estados', 'undefined', 'null'])) {
            $query->where('status', $request->status);
        }

        // Filtro por categoría
        if ($request->has('category') && $request->category != '') {
            $query->where('category', $request->category);
        }

        // Ordenamiento
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_order', 'desc');
        
        $allowedFields = ['business_name', 'category', 'status', 'offered_price', 'created_at'];
        if (in_array($sortField, $allowedFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Paginación
        $perPage = $request->get('per_page', 10);
        $captaciones = $query->paginate($perPage);

        return response()->json($captaciones);
    }

    public function store(StoreCaptacionRequest $request)
    {
        $validatedData = $request->validated();

        // Si es vendedor, forzar a que sea su ID
        if ($request->user()->role !== 'admin') {
            $validatedData['seller_id'] = $request->user()->id;
        }

        $captacion = Captacion::create($validatedData);

        return response()->json([
            'message' => 'Captación creada exitosamente.',
            'captacion' => $captacion
        ], 201);
    }

    public function quickStore(Request $request)
    {
        $user = $request->user();

        $validatedData = $request->validate([
            'business_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'phone' => 'required|string',
            'status' => 'required|in:Captación,Follow-up,Training,Negotiation,Closed Sale,Lost',
            'notes' => 'nullable|string',
            'address' => 'nullable|string',
            'google_maps' => 'nullable|string'
        ]);

        $validatedData['category'] = 'Comercio Minorista'; // valor por defecto rápido
        $validatedData['address'] = $validatedData['address'] ?? 'Captura rápida en terreno';
        $validatedData['seller_id'] = $user->id; // El vendedor actual

        $captacion = Captacion::create($validatedData);

        return response()->json([
            'message' => 'Captación rápida guardada con éxito.',
            'captacion' => $captacion
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $captacion = Captacion::with(['seller', 'visits', 'followups', 'sales', 'suggestions'])->findOrFail($id);

        Gate::authorize('view', $captacion);

        return response()->json($captacion);
    }

    public function update(UpdateCaptacionRequest $request, $id)
    {
        $captacion = Captacion::findOrFail($id);

        Gate::authorize('update', $captacion);

        $validatedData = $request->validated();

        $captacion->update($validatedData);

        return response()->json([
            'message' => 'Captación actualizada exitosamente.',
            'captacion' => $captacion
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $captacion = Captacion::findOrFail($id);

        Gate::authorize('delete', $captacion);

        $captacion->delete();

        return response()->json([
            'message' => 'Captación eliminada exitosamente.'
        ]);
    }
}
