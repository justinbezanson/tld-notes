<?php

use App\Models\Region;
use App\Models\Run;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a region belongs to a run', function () {
    $run = Run::factory()->create();
    $region = Region::factory()->for($run)->create();

    expect($region->run->is($run))->toBeTrue();
});

test('a region belongs to a user', function () {
    $user = User::factory()->create();
    $region = Region::factory()->for($user, 'user')->create();

    expect($region->user->is($user))->toBeTrue();
});

test('a run has many regions', function () {
    $run = Run::factory()
        ->has(Region::factory()->count(2))
        ->create();

    expect($run->regions)->toHaveCount(2)
        ->and($run->regions->every(fn (Region $region) => $region->run->is($run)))->toBeTrue();
});

test('deleting a run cascades to its regions', function () {
    $run = Run::factory()
        ->has(Region::factory()->count(2))
        ->create();

    $run->delete();

    expect(Region::where('run_id', $run->id)->exists())->toBeFalse();
});

test('deleting a user cascades to their regions', function () {
    $user = User::factory()->create();
    $region = Region::factory()->for($user, 'user')->create();

    $user->delete();

    expect(Region::where('id', $region->id)->exists())->toBeFalse();
});

test('an authenticated user can add a region to their run', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->from(route('runs.show', $run))
        ->post(route('runs.regions.store', $run), [
            'region_id' => 'mystery-lake',
        ])
        ->assertRedirect(route('runs.show', $run));

    $this->assertDatabaseHas('regions', [
        'run_id' => $run->id,
        'user_id' => $run->user_id,
        'region_id' => 'mystery-lake',
    ]);
});

test('adding a general region defaults to the general bucket', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.regions.store', $run), [
            'region_id' => 'GENERAL',
        ]);

    $this->assertDatabaseHas('regions', [
        'run_id' => $run->id,
        'region_id' => 'GENERAL',
    ]);
});

test('adding a region requires a valid region id', function () {
    $run = Run::factory()->create();

    $this->actingAs($run->user)
        ->post(route('runs.regions.store', $run), [
            'region_id' => 'not-a-real-region',
        ])
        ->assertSessionHasErrors(['region_id' => 'The selected region id is invalid.']);

    expect(Region::where('run_id', $run->id)->count())->toBe(0);
});

test('a region can only be added once per run', function () {
    $run = Run::factory()->create();
    Region::factory()->for($run)->create(['region_id' => 'mystery-lake']);

    $this->actingAs($run->user)
        ->post(route('runs.regions.store', $run), [
            'region_id' => 'mystery-lake',
        ])
        ->assertSessionHasErrors(['region_id' => 'The region id has already been taken.']);

    expect(Region::where('run_id', $run->id)->count())->toBe(1);
});

test('an authenticated user can use the same region across different runs', function () {
    $user = User::factory()->create();
    $first = Run::factory()->for($user)->create();
    $second = Run::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('runs.regions.store', $first), ['region_id' => 'mystery-lake']);
    $this->post(route('runs.regions.store', $second), ['region_id' => 'mystery-lake']);

    expect(Region::where('region_id', 'mystery-lake')->count())->toBe(2);
});

test('a user cannot add a region to another user run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for(User::factory())->create();

    $this->actingAs($user)
        ->post(route('runs.regions.store', $run), [
            'region_id' => 'mystery-lake',
        ])
        ->assertForbidden();

    expect(Region::where('run_id', $run->id)->count())->toBe(0);
});

test('guests are redirected to login when adding a region', function () {
    $run = Run::factory()->create();

    $this->post(route('runs.regions.store', $run), [
        'region_id' => 'mystery-lake',
    ])->assertRedirect(route('login'));
});

test('the run show page lists the run regions', function () {
    $run = Run::factory()->create();
    $region = Region::factory()->for($run)->create(['region_id' => 'blackrock']);

    $this->actingAs($run->user)
        ->get(route('runs.show', $run))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Runs/Show')
            ->has('regions', 1)
            ->where('regions.0.region_id', 'blackrock'));
});
