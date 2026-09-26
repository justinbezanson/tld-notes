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

it('resolves the display name for an item id', function () {
    expect(Items::nameFor('GEAR_BallisticVest'))->toBe('Ballistic Vest');
});

it('returns null for an unknown item id', function () {
    expect(Items::nameFor('NOT_A_REAL_ITEM'))->toBeNull();
});
