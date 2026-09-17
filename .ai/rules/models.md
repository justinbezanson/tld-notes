---
paths:
  - app/Models/NotesItem.php
---

# Models

## Location scoping lives on the note, not notes_items
notes_items has no location_id — the location lives on the parent note (notes.location_id, 'GENERAL' stored as null). NotesItems only carry note_id, item_id (nullable), item_name, quantity; item_name is used for free-text line notes when item_id is null.
