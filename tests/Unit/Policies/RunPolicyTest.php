<?php

use App\Models\Run;
use App\Models\User;
use App\Policies\RunPolicy;

test('any authenticated user may create a run', function () {
    $user = User::factory()->create();

    expect((new RunPolicy)->create($user))->toBeTrue();
});

test('a user may delete their own run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for($user)->create();

    expect((new RunPolicy)->delete($user, $run))->toBeTrue();
});

test('a user cannot delete another user run', function () {
    $user = User::factory()->create();
    $run = Run::factory()->for(User::factory())->create();

    expect((new RunPolicy)->delete($user, $run))->toBeFalse();
});
