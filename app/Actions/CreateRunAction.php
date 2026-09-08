<?php

namespace App\Actions;

use App\Models\Run;
use App\Models\User;

class CreateRunAction
{
    /**
     * Create a new run for the given user.
     */
    public function execute(User $user, string $name, string $runType): Run
    {
        return Run::create([
            'name' => $name,
            'run_type' => $runType,
            'user_id' => $user->id,
        ]);
    }
}
