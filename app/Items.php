<?php

namespace App;

use Illuminate\Support\Facades\Cache;

class Items
{
    /**
     * The cache key is derived from the source file's modified time so that
     * redeploying items.json invalidates the cached value automatically.
     *
     * @return array<int, array{title: string, categories: array<int, array{title: string, sub: string, items: array<int, array{name: string, id: string}>}>}>
     */
    public static function all(): array
    {
        $path = resource_path('data/items.json');

        return Cache::rememberForever(
            'items.'.(string) filemtime($path),
            static fn (): array => json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR)['sections'],
        );
    }

    /**
     * @return array<int, string>
     */
    public static function ids(): array
    {
        $ids = [];

        foreach (self::all() as $section) {
            foreach ($section['categories'] as $category) {
                foreach ($category['items'] as $item) {
                    $ids[] = $item['id'];
                }
            }
        }

        return $ids;
    }
}
