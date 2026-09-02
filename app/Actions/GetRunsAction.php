<?php

namespace App\Actions;

use App\Models\Run;
use App\Models\User;
use Illuminate\Support\Collection;

class GetRunsAction
{
    /**
     * Get the most recent runs for the given user.
     *
     * @return Collection<int, Run>
     */
    public function execute(User $user): Collection
    {
        return Run::query()
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
