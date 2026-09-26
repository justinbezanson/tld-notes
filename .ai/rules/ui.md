---
paths:
  - 'resources/js/components/ui/**'
---

# Ui

## Revert the package bumps shadcn-vue add makes
`npx shadcn-vue@latest add <component> --yes` rewrites package.json/package-lock.json even when it adds no new dependency: it bumped @lucide/vue 1.45->1.48 and reka-ui 2.10.4->2.10.5 on separate runs. The project pins those versions, so after every add run `git checkout package.json package-lock.json && npm ci` and confirm the new component still builds against the pinned reka-ui. Check `node_modules/reka-ui/dist/<Primitive>` first to confirm the primitive exists in the pinned version (NumberField, ColorField, Stepper all ship with 2.10.4).
