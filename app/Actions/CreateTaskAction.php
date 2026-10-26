<?php

namespace App\Actions;

use App\Models\Run;
use App\Models\Task;

class CreateTaskAction
{
    /**
     * Add a task to the given run.
     */
    public function execute(Run $run, string $description): Task
    {
        return $run->tasks()->create([
            'status' => false,
            'description' => $description,
        ]);
    }
}
