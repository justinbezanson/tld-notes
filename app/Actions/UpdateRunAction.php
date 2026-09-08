<?php

namespace App\Actions;

use App\Models\Run;

class UpdateRunAction
{
    /**
     * Update the given run's settings.
     */
    public function execute(Run $run, string $name, string $runType): Run
    {
        $run->update([
            'name' => $name,
            'run_type' => $runType,
        ]);

        return $run;
    }
}
