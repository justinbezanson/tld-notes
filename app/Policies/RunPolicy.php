<?php

namespace App\Policies;

use App\Models\User;

class RunPolicy
{
    /**
     * Determine whether the user can create a run.
     */
    public function create(User $user): bool
    {
        return true;
    }
}
