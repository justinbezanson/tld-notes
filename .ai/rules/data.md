---
paths:
  - 'resources/data/**'
---

# Data

## Game reference data: JSON files are canonical
resources/data/*.json (regions, items) are the single source of truth for game reference data. Frontend reads them via the @data alias (tsconfig paths + vite resolve.alias; import regions from '@data/regions.json'). Backend reads the same files through the cached accessors App\Regions and App\Items (json_decode + Cache::rememberForever keyed on filemtime so redeploys auto-invalidate). Never hand-mirror this data in enums/constants or pass it through Inertia props — that reintroduces drift and re-sends the payload on every request.
