<?php

namespace App\Actions;

use App\Models\Note;

class DeleteNoteAction
{
    /**
     * Delete the given note, cascading to its item lines.
     */
    public function execute(Note $note): void
    {
        $note->delete();
    }
}
