<?php

use App\Models\Note;
use App\Models\Run;
use App\Models\User;
use App\RunType;
use Inertia\Testing\AssertableInertia as Assert;

test('a run belongs to a user', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for($user)->create();

    expect($run->user->is($user))->toBeTrue();
});

test('a run defaults its run type to custom', function () {
    $run = Run::factory()->create();

    expect($run->run_type)->toBe(RunType::Custom);
});

test('a run casts its stored run type value', function () {
    $run = Run::factory()->create(['run_type' => RunType::Stalker]);
    $fresh = Run::findOrFail($run->id);

    expect($fresh->run_type)->toBe(RunType::Stalker)
        ->and($fresh->getAttributes()['run_type'])->toBe('STALKER');
});

test('a run has many notes', function () {
    $run = Run::factory()
        ->has(Note::factory()->count(2))
        ->create();

    expect($run->notes)->toHaveCount(2)
        ->and($run->notes->every(fn (Note $note) => $note->run->is($run)))->toBeTrue();
});

test('a note belongs to a run', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create();

    expect($note->run->is($run))->toBeTrue();
});

test('deleting a run cascades to its notes', function () {
    $run = Run::factory()
        ->has(Note::factory()->count(2))
        ->create();

    $run->delete();

    expect(Note::where('run_id', $run->id)->exists())->toBeFalse();
});

test('deleting a user cascades to their runs', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for($user)->create();

    $user->delete();

    expect(Run::where('id', $run->id)->exists())->toBeFalse();
});

test('the dashboard lists only the authenticated user runs newest first', function () {
    $user = User::factory()->create();
    $newer = Run::factory()->for($user)->create(['name' => 'Newer', 'created_at' => now()]);
    $older = Run::factory()->for($user)->create(['name' => 'Older', 'created_at' => now()->subDay()]);
    Run::factory()->for(User::factory())->create(['name' => 'Others']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Runs/Index')
            ->has('runs', 2)
            ->where('runs.0.name', 'Newer')
            ->where('runs.0.run_type', 'CUSTOM')
            ->where('runs.1.name', 'Older'));
});
