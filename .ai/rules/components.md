---
paths:
  - 'resources/js/components/**'
---

# Components

## New dialogs use FormDialog + FormField
Do not hand-roll Dialog + DialogHeader + DialogFooter scaffolding or the Label/InputError field trio in a page or feature component. Use FormDialog.vue (defineModel 'open', optional #trigger slot, emits 'submit' from its own <form>) and FormField.vue; pass submit-variant="destructive" / submit-label / processing-label for confirm dialogs. Trap: a :description attribute must not contain a JS template literal with escaped double quotes — HTML closes the attribute at the first `"`, so vue-tsc fails with "':' expected"; move the string into a computed instead. Also note resources/js/components/ui/* is prettier+eslint-ignored (shadcn-generated), so hand-written components belong in components/ root or a feature subfolder.

## Grid items holding a Textarea need min-w-0
shadcn's Textarea ships `field-sizing-content`, so a textarea's min-content width grows with its text. Grid/flex items default to min-width:auto (= min-content), so one long line used to blow the grid track out past the fixed-width DialogContent: children rendered outside the modal (quantity field pushed out, textarea/buttons stretched past the edge). Any grid or flex container that can hold a Textarea or long text must put min-w-0 on the container and on each grid item (FormDialog body grid, FormField root, NoteItemsField root). FormDialog's DialogContent also carries max-h-[85vh] overflow-y-auto so long item lists can't push the footer off-screen; Select and Popover contents are portaled, so scrolling inside is safe. Keep min-w-0 on flex rows with fixed-width siblings (quantity NumberField, trash Button) so the fixed controls can never be compressed.
