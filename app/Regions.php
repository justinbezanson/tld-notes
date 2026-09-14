<?php

namespace App;

use Illuminate\Support\Facades\Cache;

class Regions
{
    /**
     * The cache key is derived from the source file's modified time so that
     * redeploying regions.json invalidates the cached value automatically.
     *
     * @return array<int, array{name: string, id: string, locations: array<int, array{name: string, id: string}>}>
     */
    public static function all(): array
    {
        $path = resource_path('data/regions.json');

        return Cache::rememberForever(
            'regions.'.(string) filemtime($path),
            static fn (): array => json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR),
        );
    }

    /**
     * @return array<int, string>
     */
    public static function ids(): array
    {
        return array_column(self::all(), 'id');
    }

    /**
     * @return array<int, string>
     */
    public static function locationsFor(string $regionId): array
    {
        foreach (self::all() as $region) {
            if ($region['id'] === $regionId) {
                return array_column($region['locations'], 'id');
            }
        }

        return [];
    }

    public static function locationBelongsTo(string $regionId, string $locationId): bool
    {
        return in_array($locationId, self::locationsFor($regionId), true);
    }
}
