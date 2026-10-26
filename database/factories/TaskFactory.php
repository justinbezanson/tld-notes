<?php

namespace Database\Factories;

use App\Models\Run;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status' => false,
            'description' => fake()->words(3, true),
            'run_id' => Run::factory(),
        ];
    }
}
