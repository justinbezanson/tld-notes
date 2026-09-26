---
paths:
  - 'resources/js/routes/**'
---

# Routes

## Regenerate Wayfinder with the vite plugin, not artisan
Do not regenerate with `php artisan wayfinder:generate` — the project configures the generator in vite.config.ts as `wayfinder({ formVariants: true })`, and the artisan command has no such flag, so it rewrites every helper without the `.form()` method and breaks the auth/settings pages (TS2339: Property 'form' does not exist). Add a route and run `npm run build` (or `npm run dev`); the vite plugin regenerates resources/js/routes + resources/js/actions, which are gitignored.
