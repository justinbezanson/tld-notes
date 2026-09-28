---
paths:
  - 'resources/js/test/**'
---

# Test

## Test harness lives in resources/js/test; http/form/menu defaults matter
All shared helpers live in resources/js/test and are imported by alias (`@/test/dialog` etc.), never duplicated into a spec. Two traps: `resetHttp()` rejects any request the spec did not stub, because a mock resolving `undefined` writes undefined into reactive state and breaks the next assertion; and `Input.vue` uses a passive `useVModel`, so specs must `await wrapper.setValue()` instead of assigning to the emitted value. Portal-based content (Dialog, Sheet, Popover, dropdown) needs `attachTo: document.body` plus `nextTick`, and Reka dropdowns open from a plain left-button click — use `clickMenuTrigger()`/`menuContent()`.
