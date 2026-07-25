<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Sale;

class SalePolicy
{
    public function delete(User $user, Sale $sale): bool
    {
        return $user->role === 'admin';
    }
}
