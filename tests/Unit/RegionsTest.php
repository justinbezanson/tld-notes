<?php

use App\Regions;

beforeEach(function () {
    config(['cache.default' => 'array']);
});

it('parses the region reference data', function () {
    $expected = json_decode(
        (string) file_get_contents(resource_path('data/regions.json')),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect(Regions::all())->toBe($expected);
});

it('lists every region id from the source file', function () {
    expect(Regions::ids())
        ->toBe(array_column(Regions::all(), 'id'))
        ->toContain('ash-canyon', 'mountain-town', 'sundered-pass');
});

it('returns the location ids for a region', function () {
    expect(Regions::locationsFor('ash-canyon'))
        ->toContain('anglers-den', 'climbers-cave');
});

it('returns no locations for an unknown region', function () {
    expect(Regions::locationsFor('narnia'))->toBe([]);
});

it('confirms whether a location belongs to a region', function () {
    expect(Regions::locationBelongsTo('ash-canyon', 'anglers-den'))->toBeTrue()
        ->and(Regions::locationBelongsTo('mountain-town', 'anglers-den'))->toBeFalse();
});
