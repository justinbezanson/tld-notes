<?php

use App\Models\Run;
use App\Models\Task;

test('a task belongs to a run', function () {
    $run = Run::factory()->create();
    $task = Task::factory()->for($run)->create();

    expect($task->run->is($run))->toBeTrue();
});

test('a task is incomplete by default', function () {
    $run = Run::factory()->create();
    $task = Task::create([
        'run_id' => $run->id,
        'description' => 'Find the bunker key',
    ]);

    expect($task->fresh()->status)->toBeFalse();
});

test('a task status is cast to a boolean', function () {
    $task = Task::factory()->create(['status' => true]);

    expect($task->fresh()->status)->toBeTrue();
});

test('a run has many tasks', function () {
    $run = Run::factory()->create();
    Task::factory()->count(2)->for($run)->create();

    expect($run->tasks)->toHaveCount(2)
        ->and($run->tasks->every(fn (Task $task) => $task->run->is($run)))->toBeTrue();
});

test('deleting a run cascades to its tasks', function () {
    $run = Run::factory()->create();
    Task::factory()->for($run)->create();

    $run->delete();

    expect(Task::where('run_id', $run->id)->exists())->toBeFalse();
});
