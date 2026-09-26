---
paths:
  - 'resources/js/components/runs/**'
---

# Runs

## Regions.json lookups go through useGameData; collapse state stays in NotesPanel
No component may import @data/regions.json directly — call composables/useGameData.ts (findRegion, regionName, locationName, locationOptionsFor, regionOptions; GENERAL_ID is the sentinel stored as null in the notes table). RegionCard's open state is controlled by NotesPanel via an openRegionIds Set keyed by region.region_id, not a local ref: a local ref collapses every card when Inertia reloads props after adding a note or region, and a single shared ref toggles all cards at once. NotesPanel groups notes once with lib/notes.ts groupNotesByRegion and passes each region's slice down; do not re-filter per card.
