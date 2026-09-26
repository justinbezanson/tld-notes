<?php

namespace App\Actions;

use App\Items;
use App\Models\Note;
use App\Models\Run;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateNoteAction
{
    /**
     * Add a note, along with its item lines, to the given run.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public function execute(
        User $user,
        Run $run,
        string $regionId,
        ?string $locationId,
        ?string $noteText = null,
        array $items = [],
    ): Note {
        return DB::transaction(function () use ($user, $run, $regionId, $locationId, $noteText, $items): Note {
            $note = Note::create([
                'region_id' => $regionId,
                'location_id' => $locationId,
                'note_text' => $noteText,
                'run_id' => $run->id,
                'user_id' => $user->id,
            ]);

            $note->items()->createMany($this->itemAttributes($items));

            return $note->load('items');
        });
    }

    /**
     * Build the notes_items attributes, naming each line from the item reference
     * data whenever it carries an item id.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array{item_id: string|null, item_name: string, quantity: int}>
     */
    private function itemAttributes(array $items): array
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
