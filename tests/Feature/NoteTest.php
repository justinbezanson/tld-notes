<?php

use App\Models\Note;
use App\Models\NotesItem;
use App\Models\Region;
use App\Models\Run;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a note belongs to a run', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create();

    expect($note->run->is($run))->toBeTrue();
});

test('a note has many items', function () {
    $note = Note::factory()
        ->has(NotesItem::factory()->count(2), 'items')
        ->create();

    expect($note->items)->toHaveCount(2)
        ->and($note->items->every(fn (NotesItem $item) => $item->note->is($note)))->toBeTrue();
});

test('deleting a note cascades to its items', function () {
    $note = Note::factory()
        ->has(NotesItem::factory()->count(2), 'items')
        ->create();

    $note->delete();

    expect(NotesItem::where('note_id', $note->id)->exists())->toBeFalse();
});

test('a region can hold more than one note', function () {
    $run = Run::factory()->create();

    Note::factory()->count(2)->for($run)->create(['region_id' => 'mystery-lake']);

    expect(Note::where('run_id', $run->id)->where('region_id', 'mystery-lake')->count())->toBe(2);
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

test('an authenticated user can add a note with items and text', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'note_text' => 'Crate by the door has extra matches.',
            'items' => [
                ['item_id' => 'GEAR_BallisticVest', 'item_name' => 'Ballistic Vest', 'quantity' => 1],
                ['item_id' => 'GEAR_Hardwood', 'item_name' => 'Fir Firewood', 'quantity' => 12],
            ],
        ])
        ->assertRedirect(route('runs.show', $run))
        ->assertSessionHasNoErrors();

    $note = Note::where('run_id', $run->id)->sole();

    expect($note->note_text)->toBe('Crate by the door has extra matches.')
        ->and($note->items)->toHaveCount(2);

    $this->assertDatabaseHas('notes_items', [
        'note_id' => $note->id,
        'item_id' => 'GEAR_BallisticVest',
        'item_name' => 'Ballistic Vest',
        'quantity' => 1,
    ]);

    $this->assertDatabaseHas('notes_items', [
        'note_id' => $note->id,
        'item_id' => 'GEAR_Hardwood',
        'item_name' => 'Fir Firewood',
        'quantity' => 12,
    ]);
});

test('a note item name is taken from the item reference data', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_id' => 'GEAR_BallisticVest', 'item_name' => 'Definitely Not A Vest', 'quantity' => 1],
            ],
        ]);

    $note = Note::where('run_id', $run->id)->sole();

    expect($note->items->first()?->item_name)->toBe('Ballistic Vest');
});

test('a note keeps a free form item line without an item id', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_name' => 'Some unidentified berries', 'quantity' => 3],
            ],
        ]);

    $note = Note::where('run_id', $run->id)->sole();

    expect($note->items->first()?->item_id)->toBeNull()
        ->and($note->items->first()?->item_name)->toBe('Some unidentified berries')
        ->and($note->items->first()?->quantity)->toBe(3);
});

test('a note can be added without items or text', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'note_text' => '',
            'items' => [],
        ])
        ->assertSessionHasNoErrors();

    $note = Note::where('run_id', $run->id)->sole();

    expect($note->note_text)->toBeNull()
        ->and($note->items)->toHaveCount(0);
});

test('adding a note requires a known item id', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_id' => 'NOT_A_REAL_ITEM', 'item_name' => 'Mystery Item', 'quantity' => 1],
            ],
        ])
        ->assertSessionHasErrors(['items.0.item_id' => 'The selected items.0.item_id is invalid.']);

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('adding a note requires an item name', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_id' => 'GEAR_BallisticVest', 'quantity' => 1],
            ],
        ])
        ->assertSessionHasErrors(['items.0.item_name' => 'The items.0.item_name field is required.']);

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('adding a note requires an item quantity', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_id' => 'GEAR_BallisticVest', 'item_name' => 'Ballistic Vest'],
            ],
        ])
        ->assertSessionHasErrors(['items.0.quantity' => 'The items.0.quantity field is required.']);

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('an item quantity cannot be negative', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.notes.store', $run), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_id' => 'GEAR_BallisticVest', 'item_name' => 'Ballistic Vest', 'quantity' => -3],
            ],
        ])
        ->assertSessionHasErrors(['items.0.quantity']);

    expect(Note::where('run_id', $run->id)->count())->toBe(0);
});

test('the run show page lists the items for each note', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
        'note_text' => 'Matches by the door.',
    ]);
    NotesItem::factory()->for($note)->create([
        'item_id' => 'GEAR_BallisticVest',
        'item_name' => 'Ballistic Vest',
        'quantity' => 1,
    ]);

    $this->actingAs($run->user)
        ->get(route('runs.show', $run))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Runs/Show')
            ->has('notes', 1)
            ->where('notes.0.note_text', 'Matches by the door.')
            ->has('notes.0.items', 1)
            ->where('notes.0.items.0.item_id', 'GEAR_BallisticVest')
            ->where('notes.0.items.0.item_name', 'Ballistic Vest')
            ->where('notes.0.items.0.quantity', 1));
});

test('an authenticated user can update a note', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
        'note_text' => 'Matches by the door.',
    ]);
    NotesItem::factory()->for($note)->create([
        'item_id' => 'GEAR_BallisticVest',
        'item_name' => 'Ballistic Vest',
        'quantity' => 1,
    ]);

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->put(route('runs.notes.update', [$run, $note]), [
            'region_id' => 'mystery-lake',
            'location_id' => 'fishing-hut',
            'note_text' => 'Rope is frayed, replaced it.',
            'items' => [
                ['item_id' => 'GEAR_Hardwood', 'item_name' => 'Fir Firewood', 'quantity' => 8],
            ],
        ])
        ->assertRedirect(route('runs.show', $run))
        ->assertSessionHasNoErrors();

    $note->refresh()->load('items');

    expect($note->location_id)->toBe('fishing-hut')
        ->and($note->note_text)->toBe('Rope is frayed, replaced it.')
        ->and($note->items)->toHaveCount(1)
        ->and($note->items->first()?->item_id)->toBe('GEAR_Hardwood')
        ->and($note->items->first()?->quantity)->toBe(8);
});

test('updating a note replaces its item lines', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ]);
    NotesItem::factory()->count(2)->for($note)->create();

    $this->actingAs($run->user)
        ->put(route('runs.notes.update', [$run, $note]), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_id' => 'GEAR_BallisticVest', 'item_name' => 'Ballistic Vest', 'quantity' => 3],
            ],
        ]);

    expect($note->items()->count())->toBe(1)
        ->and($note->items()->first()?->quantity)->toBe(3);
});

test('a note can be updated without items or text', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
        'note_text' => 'Matches by the door.',
    ]);
    NotesItem::factory()->for($note)->create();

    $this->actingAs($run->user)
        ->put(route('runs.notes.update', [$run, $note]), [
            'region_id' => 'mystery-lake',
            'location_id' => 'GENERAL',
            'note_text' => '',
            'items' => [],
        ])
        ->assertSessionHasNoErrors();

    $note->refresh()->load('items');

    expect($note->location_id)->toBeNull()
        ->and($note->note_text)->toBeNull()
        ->and($note->items)->toHaveCount(0);
});

test('updating a note requires a location within the region', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ]);

    $this->actingAs($run->user)
        ->put(route('runs.notes.update', [$run, $note]), [
            'region_id' => 'mystery-lake',
            'location_id' => 'power-plant',
        ])
        ->assertSessionHasErrors('location_id');

    expect($note->refresh()->location_id)->toBe('camp-office');
});

test('updating a note item name is taken from the item reference data', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ]);

    $this->actingAs($run->user)
        ->put(route('runs.notes.update', [$run, $note]), [
            'region_id' => 'mystery-lake',
            'location_id' => 'camp-office',
            'items' => [
                ['item_id' => 'GEAR_BallisticVest', 'item_name' => 'Definitely Not A Vest', 'quantity' => 1],
            ],
        ]);

    expect($note->items()->first()?->item_name)->toBe('Ballistic Vest');
});

test('a user cannot update a note on another user run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for(User::factory())->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ]);

    $this->actingAs($user)
        ->put(route('runs.notes.update', [$run, $note]), [
            'region_id' => 'mystery-lake',
            'location_id' => 'fishing-hut',
        ])
        ->assertForbidden();

    expect($note->refresh()->location_id)->toBe('camp-office');
});

test('a user cannot update a note that belongs to a different run', function () {
    $run = Run::factory()->create();
    $otherRun = Run::factory()->create();
    $note = Note::factory()->for($otherRun)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ]);

    $this->actingAs($run->user)
        ->put(route('runs.notes.update', [$run, $note]), [
            'region_id' => 'mystery-lake',
            'location_id' => 'fishing-hut',
        ])
        ->assertForbidden();

    expect($note->refresh()->location_id)->toBe('camp-office');
});

test('guests are redirected to login when updating a note', function () {
    $run = Run::factory()->create();
    $note = Note::factory()->for($run)->create([
        'region_id' => 'mystery-lake',
        'location_id' => 'camp-office',
    ]);

    $this->put(route('runs.notes.update', [$run, $note]), [
        'region_id' => 'mystery-lake',
        'location_id' => 'fishing-hut',
    ])->assertRedirect(route('login'));
});
