<?php

namespace App\Policies;

use App\Models\Run;
use App\Models\User;

class RunPolicy
{
    /**
     * Determine whether the user can view the run.
     */
    public function view(User $user, Run $run): bool
    {
        return $run->user_id === $user->id;
    }

    /**
     * Determine whether the user can create a run.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the run.
     */
    public function update(User $user, Run $run): bool
    {
        return $run->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the run.
     */
    public function delete(User $user, Run $run): bool
    {
        return $run->user_id === $user->id;
    }
}
