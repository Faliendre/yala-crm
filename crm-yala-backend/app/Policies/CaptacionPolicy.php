<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Captacion;

class CaptacionPolicy
{
    public function view(User $user, Captacion $captacion): bool
    {
        return $user->role === 'admin' || $captacion->seller_id === $user->id;
    }

    public function update(User $user, Captacion $captacion): bool
    {
        return $user->role === 'admin' || $captacion->seller_id === $user->id;
    }

    public function delete(User $user, Captacion $captacion): bool
    {
        return $user->role === 'admin';
    }
}
