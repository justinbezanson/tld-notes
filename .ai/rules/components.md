---
paths:
  - 'resources/js/components/**'
---

# Components

## New dialogs use FormDialog + FormField
Do not hand-roll Dialog + DialogHeader + DialogFooter scaffolding or the Label/InputError field trio in a page or feature component. Use FormDialog.vue (defineModel 'open', optional #trigger slot, emits 'submit' from its own <form>) and FormField.vue; pass submit-variant="destructive" / submit-label / processing-label for confirm dialogs. Trap: a :description attribute must not contain a JS template literal with escaped double quotes — HTML closes the attribute at the first `"`, so vue-tsc fails with "':' expected"; move the string into a computed instead. Also note resources/js/components/ui/* is prettier+eslint-ignored (shadcn-generated), so hand-written components belong in components/ root or a feature subfolder.
