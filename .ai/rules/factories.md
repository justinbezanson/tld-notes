---
paths:
  - 'database/factories/**'
---

# Factories

## Pin region_id in multi-region tests to avoid unique-index flakes
RegionFactory picks a random region id, so building two regions for one run (Region::factory()->count(2)) can randomly trigger the unique (run_id, region_id) index and flake the suite. Pin region_id explicitly ('mystery-lake') when creating more than one region per run.
