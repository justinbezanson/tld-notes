<?php

namespace App\Actions;

use App\Models\Run;

class DeleteRunAction
{
    /**
     * Delete the given run.
     */
    public function execute(Run $run): void
    {
        $run->delete();
    }
}
