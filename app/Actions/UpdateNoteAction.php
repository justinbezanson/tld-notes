<?php

namespace App\Actions;

use App\Concerns\NoteItemAttributes;
use App\Models\Note;
use Illuminate\Support\Facades\DB;

class UpdateNoteAction
{
    use NoteItemAttributes;

    /**
     * Update a note's location, text, and item lines. The item lines are
     * replaced wholesale so removed lines do not linger.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public function execute(
        Note $note,
        ?string $locationId,
        ?string $noteText = null,
        array $items = [],
    ): Note {
        return DB::transaction(function () use ($note, $locationId, $noteText, $items): Note {
            $note->update([
                'location_id' => $locationId,
                'note_text' => $noteText,
            ]);

            $note->items()->delete();

            $note->items()->createMany($this->itemAttributes($items));

            return $note->load('items');
        });
    }
}
