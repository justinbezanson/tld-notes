---
paths:
  - 'resources/js/**/*.vue'
---

# Js

## Non-submit shadcn Button needs an explicit type="button"
shadcn-vue's `Button` renders a bare `<button>` (via reka-ui Primitive) with no default `type`, so inside FormDialog's `<form>` any button without an explicit `type="button"` silently submits and runs the dialog's create/update action. This bit the "Add Item" repeater button, which saved the note instead of adding a row. Give every non-submit Button an explicit `type="button"`. Safe exceptions: FormDialog's own submit button (type="submit") and reka-ui triggers such as PopoverTrigger/SelectTrigger, which inject `type="button"` themselves even under `as-child`.
