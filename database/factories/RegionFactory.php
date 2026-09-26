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
     * Region ids this factory has already produced. A batch of regions for one
     * run has to draw without replacement, because regions are unique per run.
     *
     * @var array<int, string>
     */
    private array $regionIds = [];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'region_id' => $this->nextRegionId(),
            'run_id' => Run::factory(),
            'user_id' => User::factory(),
        ];
    }

    /**
     * Draw a region id this factory has not used yet, falling back to the whole
     * pool once every id is taken, since a run cannot hold a region twice.
     */
    private function nextRegionId(): string
    {
        $ids = Regions::ids();
        $unused = array_values(array_diff($ids, $this->regionIds));

        $regionId = $unused === [] ? fake()->randomElement($ids) : $unused[array_rand($unused)];

        $this->regionIds[] = $regionId;

        return $regionId;
    }
}
