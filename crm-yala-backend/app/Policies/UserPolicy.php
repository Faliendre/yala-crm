<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function update(User $currentUser, User $user): bool
    {
        return $currentUser->role === 'admin' || $currentUser->id === $user->id;
    }
}
