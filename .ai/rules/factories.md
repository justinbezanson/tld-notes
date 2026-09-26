---
paths:
  - 'database/factories/**'
  - 'database/factories/*.php'
---

# Factories

## Pin region_id in multi-region tests to avoid unique-index flakes
RegionFactory picks a random region id, so building two regions for one run (Region::factory()->count(2)) can randomly trigger the unique (run_id, region_id) index and flake the suite. Pin region_id explicitly ('mystery-lake') when creating more than one region per run.

## Factories must respect unique constraints per batch
Regions are unique per run (unique index on run_id, region_id) and Regions::ids() only has 16 entries, so `fake()->randomElement(Regions::ids())` in a factory made any test that creates two or more regions for one run fail roughly 1 run in 16. RegionFactory now draws without replacement from an instance-level pool, which is batch scoped: one factory instance serves a whole `->count(n)` batch, and each new test/batch starts over. Do not use a static/process-wide pool here — ids consumed by earlier tests belong to other runs and are safe to reuse, so process-wide uniqueness only starves a later batch. `fake()->unique()` is also wrong for a 16 item pool because Faker's unique state is process wide and would throw once the pool is exhausted.
