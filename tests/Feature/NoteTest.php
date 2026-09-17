<?php

use App\Models\Note;
use App\Models\Region;
use App\Models\Run;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a note belongs to a run', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create();

    expect($note->run->is($run))->toBeTrue();
});

test('a note stores its text note', function () {
    $note = Note::factory()->create(['note_text' => 'Stashed rifle behind the counter.']);

    expect($note->note_text)->toBe('Stashed rifle behind the counter.');
});

test('deleting a run cascades to its notes', function () {
    $run = Run::factory()
        ->has(Note::factory()->count(2))
        ->create();

    $run->delete();

    expect(Note::where('run_id', $run->id)->exists())->toBeFalse();
});

test('an authenticated user can add a note to a run region', function () {
    $run = Run::factory()->create();
    Region::factory()->for($run)->create(['region_id' => 'mystery-lake']);

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
        ])
        ->assertRedirect(route('runs.show', $run));

    $this->assertDatabaseHas('notes', [
        'run_id' => $run->id,
        'user_id' => $run->user_id,
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ]);
});

test('a general location is stored without a specific location', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'GENERAL',
        ]);

    $this->assertDatabaseHas('notes', [
        'run_id' => $run->id,
        'region_id' => 'mystery-lake',
        'location_id' => null,
    ]);
});

test('a note can be added to the general region', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'GENERAL',
            'location_id' => 'GENERAL',
        ]);

    $this->assertDatabaseHas('notes', [
        'run_id' => $run->id,
        'region_id' => 'GENERAL',
        'location_id' => null,
    ]);
});

test('adding a note requires a valid region id', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'not-a-real-region',
            'location_id' => 'camp-office',
        ])
        ->assertSessionHasErrors(['region_id' => 'The selected region id is invalid.']);

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('adding a note requires a location within the region', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'ash-canyon',
            'location_id' => 'power-plant',
        ])
        ->assertSessionHasErrors(['location_id' => 'The selected location id is invalid.']);

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('adding a note requires a location', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
        ])
        ->assertSessionHasErrors(['location_id' => 'The location id field is required.']);

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('a user cannot add a note to another user run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for(User::factory())->create();

    $this->actingAs($user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
        ])
        ->assertForbidden();

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('guests are redirected to login when adding a note', function () {
    $run = Run::factory()->create();

    $this->post(route('runs.notes.store', $run), [
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ])->assertRedirect(route('login'));
});

test('the run show page lists the run notes', function () {
    $run = Run::factory()->create();
    Note::factory()->for($run)->create([
        'region_id' => 'blackrock',
        'location_id' => 'power-plant',
    ]);

    $this->actingAs($run->user)
        ->get(route('runs.show', $run))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Runs/Show')
            ->has('notes', 1)
            ->where('notes.0.region_id', 'blackrock')
            ->where('notes.0.location_id', 'power-plant'));
});
