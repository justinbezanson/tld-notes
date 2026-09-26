<?php

namespace App\Concerns;

use App\Items;

trait NoteItemAttributes
{
    /**
     * Build the notes_items attributes, naming each line from the item reference
     * data whenever it carries an item id.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array{item_id: string|null, item_name: string, quantity: int}>
     */
    protected function itemAttributes(array $items): array
    {
        $attributes = [];

        foreach ($items as $item) {
            $itemId = isset($item['item_id']) ? (string) $item['item_id'] : null;
            $itemName = (string) ($item['item_name'] ?? '');

            $attributes[] = [
                'item_id' => $itemId,
                'item_name' => $itemId !== null ? (Items::nameFor($itemId) ?? $itemName) : $itemName,
                'quantity' => (int) ($item['quantity'] ?? 0),
            ];
        }

        return $attributes;
    }
}
