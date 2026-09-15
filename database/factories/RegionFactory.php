<?php

namespace Database\Factories;

use App\Models\Region;
use App\Models\Run;
use App\Models\User;
use App\Regions;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Region>
 */
class RegionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'region_id' => fake()->randomElement(Regions::ids()),
            'run_id' => Run::factory(),
            'user_id' => User::factory(),
        ];
    }
}
