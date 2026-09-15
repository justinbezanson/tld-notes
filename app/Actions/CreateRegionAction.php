<?php

namespace App\Actions;

use App\Models\Region;
use App\Models\Run;
use App\Models\User;

class CreateRegionAction
{
    /**
     * Add a region to the given run.
     */
    public function execute(User $user, Run $run, string $regionId): Region
    {
        return Region::create([
            'region_id' => $regionId,
            'run_id' => $run->id,
            'user_id' => $user->id,
        ]);
    }
}
