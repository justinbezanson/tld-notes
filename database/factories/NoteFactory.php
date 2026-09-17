<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\Run;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'region_id' => fake()->unique()->word(),
            'location_id' => null,
            'note_text' => null,
            'user_id' => User::factory(),
            'run_id' => Run::factory(),
        ];
    }
}
