---
paths:
  - 'resources/js/**/*.vue'
  - 'resources/js/**/*.spec.ts'
---

# Js

## Non-submit shadcn Button needs an explicit type="button"
shadcn-vue's `Button` renders a bare `<button>` (via reka-ui Primitive) with no default `type`, so inside FormDialog's `<form>` any button without an explicit `type="button"` silently submits and runs the dialog's create/update action. This bit the "Add Item" repeater button, which saved the note instead of adding a row. Give every non-submit Button an explicit `type="button"`. Safe exceptions: FormDialog's own submit button (type="submit") and reka-ui triggers such as PopoverTrigger/SelectTrigger, which inject `type="button"` themselves even under `as-child`.

## Spec conventions: inertiaMock, attachTo for the title, typed props
Specs are co-located next to the file they cover. Mock Inertia with `vi.mock('@inertiajs/vue3', async () => (await import('@/test/inertia')).inertiaMock())`; never boot a router. A page that renders `<Head title>` must be mounted with `attachTo: document.body`, because HeadStub only writes a real `<title>` once the wrapper is in the document — detached mounts leave `document.title` empty. Mount helpers take `Partial<InstanceType<typeof Component>['$props']>` and merge over defaults, not `Record<string, unknown>`, so vue-tsc checks the props.
