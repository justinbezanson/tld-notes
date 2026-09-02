<?php

namespace Database\Factories;

use App\Models\Run;
use App\Models\User;
use App\RunType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Run>
 */
class RunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'user_id' => User::factory(),
            'run_type' => RunType::Custom,
        ];
    }
}
