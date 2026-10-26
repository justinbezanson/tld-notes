<?php

use App\Models\Run;
use App\Models\Task;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

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

test('the run show page lists incomplete tasks first then oldest first', function () {
    $run = Run::factory()->create();
    Task::factory()->for($run)->create([
        'status' => true,
        'description' => 'Completed task',
        'created_at' => now()->subMinutes(3),
    ]);
    Task::factory()->for($run)->create([
        'status' => false,
        'description' => 'Older task',
        'created_at' => now()->subMinutes(2),
    ]);
    Task::factory()->for($run)->create([
        'status' => false,
        'description' => 'Newer task',
        'created_at' => now()->subMinute(),
    ]);

    $this->actingAs($run->user)
        ->get(route('runs.show', $run))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Runs/Show')
            ->has('tasks', 3)
            ->where('tasks.0.description', 'Older task')
            ->where('tasks.1.description', 'Newer task')
            ->where('tasks.2.description', 'Completed task'));
});

test('an authenticated user can add a task to their run', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->post(route('runs.tasks.store', $run), [
            'description' => 'Find the bunker key',
        ])
        ->assertRedirect(route('runs.show', $run))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('tasks', [
        'run_id' => $run->id,
        'description' => 'Find the bunker key',
        'status' => false,
    ]);
});

test('adding a task requires a description', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.tasks.store', $run), [
            'description' => '',
        ])
        ->assertSessionHasErrors([
            'description' => 'The description field is required.',
        ]);

    expect(Task::where('run_id', $run->id)->count())->toBe(0);
});

test('adding a task rejects descriptions over 255 characters', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.tasks.store', $run), [
            'description' => str_repeat('a', 256),
        ])
        ->assertSessionHasErrors([
            'description' => 'The description field must not be greater than 255 characters.',
        ]);

    expect(Task::where('run_id', $run->id)->count())->toBe(0);
});

test('a user cannot add a task to another user run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for(User::factory())->create();

    $this->actingAs($user)
        ->post(route('runs.tasks.store', $run), [
            'description' => 'Find the bunker key',
        ])
        ->assertForbidden();

    expect(Task::where('run_id', $run->id)->count())->toBe(0);
});

test('guests are redirected to login when adding a task', function () {
    $run = Run::factory()->create();

    $this->post(route('runs.tasks.store', $run), [
        'description' => 'Find the bunker key',
    ])->assertRedirect(route('login'));

    expect(Task::where('run_id', $run->id)->count())->toBe(0);
});

test('an authenticated user can update a task description', function () {
    $run = Run::factory()->create();
    $task = Task::factory()->for($run)->create([
        'description' => 'Find the bunker key',
    ]);

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->patch(route('runs.tasks.update', [$run, $task]), [
            'description' => 'Find the bunker code',
        ])
        ->assertRedirect(route('runs.show', $run))
        ->assertSessionHasNoErrors();

    expect($task->fresh()->description)->toBe('Find the bunker code')
        ->and($task->fresh()->status)->toBeFalse();
});

test('an authenticated user can complete a task', function () {
    $run = Run::factory()->create();
    $task = Task::factory()->for($run)->create(['status' => false]);

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->patch(route('runs.tasks.update', [$run, $task]), [
            'status' => true,
        ])
        ->assertRedirect(route('runs.show', $run))
        ->assertSessionHasNoErrors();

    expect($task->fresh()->status)->toBeTrue();
});

test('updating a task requires a non-empty description', function () {
    $run = Run::factory()->create();
    $task = Task::factory()->for($run)->create([
        'description' => 'Find the bunker key',
    ]);

    $this->actingAs($run->user)
        ->patch(route('runs.tasks.update', [$run, $task]), [
            'description' => '',
        ])
        ->assertSessionHasErrors([
            'description' => 'The description field is required.',
        ]);

    expect($task->fresh()->description)->toBe('Find the bunker key');
});

test('a user cannot update a task on another user run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for(User::factory())->create();
    $task = Task::factory()->for($run)->create(['status' => false]);

    $this->actingAs($user)
        ->patch(route('runs.tasks.update', [$run, $task]), ['status' => true])
        ->assertForbidden();

    expect($task->fresh()->status)->toBeFalse();
});

test('a user cannot update a task that belongs to a different run', function () {
    $run = Run::factory()->create();
    $otherRun = Run::factory()->create();
    $task = Task::factory()->for($otherRun)->create(['status' => false]);

    $this->actingAs($run->user)
        ->patch(route('runs.tasks.update', [$run, $task]), ['status' => true])
        ->assertForbidden();

    expect($task->fresh()->status)->toBeFalse();
});

test('guests are redirected to login when updating a task', function () {
    $run = Run::factory()->create();
    $task = Task::factory()->for($run)->create(['status' => false]);

    $this->patch(route('runs.tasks.update', [$run, $task]), ['status' => true])
        ->assertRedirect(route('login'));

    expect($task->fresh()->status)->toBeFalse();
});

test('an authenticated user can delete a task', function () {
    $run = Run::factory()->create();
    $task = Task::factory()->for($run)->create();
    $otherTask = Task::factory()->for($run)->create();

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->delete(route('runs.tasks.destroy', [$run, $task]))
        ->assertRedirect(route('runs.show', $run))
        ->assertSessionHasNoErrors();

    expect(Task::whereKey($task->id)->exists())->toBeFalse()
        ->and(Task::whereKey($otherTask->id)->exists())->toBeTrue();
});

test('a user cannot delete a task on another user run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for(User::factory())->create();
    $task = Task::factory()->for($run)->create();

    $this->actingAs($user)
        ->delete(route('runs.tasks.destroy', [$run, $task]))
        ->assertForbidden();

    expect(Task::whereKey($task->id)->exists())->toBeTrue();
});

test('a user cannot delete a task that belongs to a different run', function () {
    $run = Run::factory()->create();
    $otherRun = Run::factory()->create();
    $task = Task::factory()->for($otherRun)->create();

    $this->actingAs($run->user)
        ->delete(route('runs.tasks.destroy', [$run, $task]))
        ->assertForbidden();

    expect(Task::whereKey($task->id)->exists())->toBeTrue();
});

test('guests are redirected to login when deleting a task', function () {
    $run = Run::factory()->create();
    $task = Task::factory()->for($run)->create();

    $this->delete(route('runs.tasks.destroy', [$run, $task]))
        ->assertRedirect(route('login'));

    expect(Task::whereKey($task->id)->exists())->toBeTrue();
});
