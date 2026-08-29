<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\NotesItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotesItem>
 */
class NotesItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'note_id' => Note::factory(),
            'location_id' => fake()->city(),
            'item_id' => fake()->unique()->numerify('ITEM####'),
            'item_name' => fake()->words(3, true),
            'quantity' => fake()->randomDigitNotNull(),
        ];
    }
}
