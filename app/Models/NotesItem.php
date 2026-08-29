<?php

namespace App\Models;

use Database\Factories\NotesItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $note_id
 * @property string|null $location_id
 * @property string|null $item_id
 * @property string $item_name
 * @property int $quantity
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Note $note
 */
#[Fillable(['note_id', 'location_id', 'item_id', 'item_name', 'quantity'])]
class NotesItem extends Model
{
    /** @use HasFactory<NotesItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class, 'note_id');
    }
}
