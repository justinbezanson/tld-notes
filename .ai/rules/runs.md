---
paths:
  - 'resources/js/components/runs/**'
---

# Runs

## Regions.json lookups go through useGameData; collapse state stays in NotesPanel
No component may import @data/regions.json directly — call composables/useGameData.ts (findRegion, regionName, locationName, locationOptionsFor, regionOptions; GENERAL_ID is the sentinel stored as null in the notes table). RegionCard's open state is controlled by NotesPanel via an openRegionIds Set keyed by region.region_id, not a local ref: a local ref collapses every card when Inertia reloads props after adding a note or region, and a single shared ref toggles all cards at once. NotesPanel groups notes once with lib/notes.ts groupNotesByRegion and passes each region's slice down; do not re-filter per card.

## Note item rows mirror the request payload, not the picker model
Note items are a nested repeater whose form rows deliberately use the request shape (`{ item_id, item_name, quantity }`, NoteItemLine) instead of the picker's selection object, and AddNoteDialog filters unselected rows before posting. That keeps Inertia error keys (`items.0.quantity`) and the form field in sync without a form.transform. The first `items.*` error is surfaced once under the repeater via a computed scan of form.errors, since each row is not a real form field.

## Share note fields with explicit v-models, never a form prop
AddNoteDialog and UpdateNoteDialog share their body through NoteFormFields.vue, which takes explicit `v-model:location-id` / `v-model:items` / `v-model:note-text` plus one error prop per field — not a `form` prop. `v-model` on a prop member is rejected by the project's `vue/no-mutating-props` rule, and the first-items-error scan lives in lib/notes.ts firstItemsError() so both dialogs surface the same message. UpdateNoteDialog is mounted behind `v-if="editingNote"` from NoteList, so its open watcher must pass `{ immediate: true }` or it never populates the form.

## Wrapper dialogs must forward FormDialog's optional #trigger slot
FormDialog only renders its DialogTrigger when `$slots.trigger` exists, so a wrapper dialog that accepts a `#trigger` slot must forward it: `<template v-if="slots.trigger" #trigger><slot name="trigger" /></template>` (useSlots() + v-if, otherwise FormDialog always sees a slot and renders an empty as-child trigger). The eff5de1 Show.vue refactor moved the "Add Region" Button into NotesPanel's `#trigger` slot, but AddRegionDialog had no slot outlet, so it rendered nothing and the button silently vanished. AddNoteDialog has no trigger (opened programmatically) and must stay that way.
