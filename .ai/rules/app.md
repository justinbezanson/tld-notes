---
paths:
  - 'app/**'
---

# App

## Per-run regions reference regions.json ids
The `regions` table stores user-added regions per run (run_id, user_id, region_id). `region_id` is either 'GENERAL' or a game reference id from resources/data/regions.json; validate with `Rule::in(['GENERAL', ...Regions::ids()])` and enforce one region per run with a unique (run_id, region_id) index. Regions are created via the `runs.regions.store` endpoint and passed to the Runs/Show page as the `regions` prop. Keep game reference data (names/locations) read from @data/regions.json, not mirrored in the regions table.
