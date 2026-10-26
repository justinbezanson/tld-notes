<?php

namespace App\Http\Controllers;

use App\Actions\CreateTaskAction;
use App\Actions\DeleteTaskAction;
use App\Actions\UpdateTaskAction;
use App\Http\Requests\DestroyTaskRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Run;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function store(StoreTaskRequest $request, CreateTaskAction $action, Run $run): RedirectResponse
    {
        $action->execute($run, $request->string('description')->toString());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Task added.')]);

        return back();
    }

    /**
     * Update one of a run's tasks. The run is type hinted so the framework binds
     * it before UpdateTaskRequest authorizes against the run policy.
     */
    public function update(UpdateTaskRequest $request, UpdateTaskAction $action, Run $run, Task $task): RedirectResponse
    {
        $action->execute(
            $task,
            $request->has('description') ? $request->string('description')->toString() : null,
            $request->has('status') ? $request->boolean('status') : null,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Task updated.')]);

        return back();
    }

    /**
     * Delete one of a run's tasks. The run is type hinted so the framework binds
     * it before DestroyTaskRequest authorizes against the run policy.
     */
    public function destroy(DestroyTaskRequest $request, DeleteTaskAction $action, Run $run, Task $task): RedirectResponse
    {
        $action->execute($task);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Task deleted.')]);

        return back();
    }
}
