<?php

use App\Items;

beforeEach(function () {
    config(['cache.default' => 'array']);
});

it('parses the item reference data', function () {
    $decoded = json_decode(
        (string) file_get_contents(resource_path('data/items.json')),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect(Items::all())->toBe($decoded['sections']);
});

it('lists every item id across all sections and categories', function () {
    $ids = Items::ids();

    expect($ids)
        ->not->toBeEmpty()
        ->toContain('GEAR_BallisticVest');
});
