<?php

namespace App\Actions;

use App\Models\Task;

class DeleteTaskAction
{
    /**
     * Delete the given task.
     */
    public function execute(Task $task): void
    {
        $task->delete();
    }
}
