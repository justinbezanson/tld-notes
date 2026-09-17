<?php

namespace App\Actions;

use App\Models\Note;
use App\Models\Run;
use App\Models\User;

class CreateNoteAction
{
    /**
     * Add a note to the given run.
     */
    public function execute(User $user, Run $run, string $regionId, ?string $locationId): Note
    {
        return Note::create([
            'region_id' => $regionId,
            'location_id' => $locationId,
            'run_id' => $run->id,
            'user_id' => $user->id,
        ]);
    }
}
