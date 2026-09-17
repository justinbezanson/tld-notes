---
paths:
  - 'app/Http/Controllers/**'
---

# Controllers

## Notes store scopes location to region from regions.json
Notes are created per run-region via POST runs/{run}/notes (runs.notes.store), scoped with authorize on run update. location_id is validated with Rule::in(['GENERAL', ...Regions::locationsFor($regionId)]) so locations only come from regions.json for that region; the 'GENERAL' sentinel is stored as null in the notes table. Never add a locations table — regions.json is canonical.
