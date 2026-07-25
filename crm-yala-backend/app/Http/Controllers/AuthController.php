<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\ChangePasswordRequest;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas. Por favor intente de nuevo.'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->last_seen = \Illuminate\Support\Carbon::now();
            $user->save();
        }

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente.'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'role' => $user->role,
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null
        ]);
    }

    public function registerUser(RegisterUserRequest $request)
    {
        $validated = $request->validated();

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'avatar' => $avatarPath,
        ]);

        return response()->json([
            'message' => 'Usuario registrado exitosamente.',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null
            ]
        ], 201);
    }

    public function listUsers(Request $request)
    {
        $users = User::orderBy('id', 'desc')->get(['id', 'username', 'role', 'last_seen', 'avatar', 'created_at']);
        
        $users->map(function ($u) {
            $lastUsedToken = \Illuminate\Support\Facades\DB::table('personal_access_tokens')
                ->where('tokenable_id', $u->id)
                ->where('tokenable_type', 'App\Models\User')
                ->max('last_used_at');
                
            // Combine both timestamps to determine the most recent activity
            $lastSeenTime = null;
            if ($u->last_seen && $lastUsedToken) {
                $lastSeenTime = \Illuminate\Support\Carbon::parse($u->last_seen)->gt($lastUsedToken) ? $u->last_seen : $lastUsedToken;
            } else {
                $lastSeenTime = $u->last_seen ?: $lastUsedToken;
            }

            $u->is_online = false;
            $u->last_seen = null;
            
            if ($lastUsedToken) {
                $u->is_online = \Illuminate\Support\Carbon::parse($lastUsedToken)->gt(\Illuminate\Support\Carbon::now()->subMinutes(5));
            }
            
            if ($lastSeenTime) {
                $u->last_seen = \Illuminate\Support\Carbon::parse($lastSeenTime)->toDateTimeString();
            }

            $u->avatar = $u->avatar ? asset('storage/' . $u->avatar) : null;
            return $u;
        });

        return response()->json($users);
    }

    public function updateUser(UpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('update', $user);

        $validated = $request->validated();

        $user->username = $validated['username'];
        
        if ($request->user()->role === 'admin' && isset($validated['role'])) {
            $user->role = $validated['role'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();

        return response()->json([
            'message' => 'Usuario actualizado exitosamente.',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null
            ]
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'No puedes eliminarte a ti mismo.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado exitosamente.']);
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta.'
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Contraseña cambiada exitosamente.'
        ]);
    }
}
