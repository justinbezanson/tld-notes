<?php

use App\Models\User;
use App\Policies\RunPolicy;

test('any authenticated user may create a run', function () {
    $user = User::factory()->create();

    expect((new RunPolicy)->create($user))->toBeTrue();
});
