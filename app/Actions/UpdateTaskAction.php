<?php

namespace App\Actions;

use App\Models\Task;

class UpdateTaskAction
{
    /**
     * Update any of the task fields that were supplied.
     */
    public function execute(
        Task $task,
        ?string $description = null,
        ?bool $status = null,
    ): Task {
        if ($description !== null) {
            $task->description = $description;
        }

        if ($status !== null) {
            $task->status = $status;
        }

        $task->save();

        return $task;
    }
}
