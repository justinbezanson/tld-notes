# Commands

Reference for the commands used in this app (Laravel 13 + Inertia 3 + Vue 3 + Tailwind 4 + Pest 4).

## Setup

```bash
composer setup
```

Installs Composer deps, creates `.env` from `.env.example`, generates `APP_KEY`, migrates,
installs npm packages, and builds assets. This is exactly what CI runs.

## Daily dev loop

```bash
composer run dev
```

Runs four processes together (see `php artisan dev:list`): `artisan serve`, `queue:listen`,
`pail` for logs, and `npm run dev` (Vite with HMR).

Run a single process when you don't want all four: `php artisan serve`, `php artisan pail`,
`npm run dev`.

```bash
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed
```

Local database is SQLite at `database/database.sqlite`.

## Frontend

```bash
npm run dev            # Vite dev server with HMR
npm run build          # production build (also regenerates Wayfinder)
npm run types:check    # vue-tsc --noEmit
npm run lint           # eslint . --fix
npm run lint:check     # eslint, no writes
npm run format         # prettier --write resources/
npm run format:check   # prettier --check resources/
```

If a change isn't showing up in the browser, you likely need `npm run dev` (or `composer run dev`)
running — `npm run build` is only for production assets.

## Backend code style and static analysis

```bash
vendor/bin/pint --dirty --format agent   # format only what you changed
vendor/bin/pint                         # format everything
composer lint                           # pint --parallel (full run)
composer lint:check                     # pint --parallel --test (CI)
composer types:check                    # phpstan analyse (level 7)
```

Pint and PHPStan run on `app/`, `bootstrap/app.php`, `config/`, `database/`, and `routes/`
(see `phpstan.neon`).

## Tests

```bash
php artisan test --compact                        # whole suite
php artisan test --compact tests/Feature/NoteTest.php
php artisan test --compact --filter="creates a note"
vendor/bin/pest tests/Feature/RegionTest.php      # same runner, direct call
```

Tests use Pest with `RefreshDatabase` against an in-memory SQLite database (`phpunit.xml`),
so no local database is touched. Create new tests with:

```bash
php artisan make:test --pest NoteTest             # feature test
php artisan make:test --pest --unit RegionsTest   # unit test
```

Do not include the suite directory in the name — `SomeFeatureTest`, not `Feature/SomeTest`.

## The full CI gate

```bash
composer ci:check
```

Runs `npm run lint:check`, `npm run format:check`, `npm run types:check`, then `composer test`
(config clear → pint check → phpstan → `artisan test`). Run this before pushing; GitHub Actions
runs the same command on every push to `main` and every PR.

## Gotchas

**Wayfinder must keep its form helpers.** `resources/js/routes` and `resources/js/actions` are
gitignored and generated from the routes. Never run the generator bare — it strips the `.form()`
helpers and breaks `npm run types:check` in CI:

```bash
php artisan wayfinder:generate --with-form --no-interaction
```

`npm run build` and `npm run dev` generate them correctly (configured with `formVariants: true`
in `vite.config.ts`), so prefer those.

**`resources/js/components/ui/*` is generated and unlinted.** That whole directory is ignored by
both ESLint and Prettier because it comes from shadcn-vue. New hand-written components go in
`resources/js/components/` (shared) or a feature subfolder such as
`resources/js/components/runs/` (run-specific).

**Game reference data lives in JSON, not the database.** `resources/data/regions.json` and
`resources/data/items.json` are canonical. The frontend imports them through the `@data` alias
(`import regionsData from '@data/regions.json'`); the backend reads them via `App\Regions` and
`App\Items`, which cache on the file's `filemtime` so a redeploy invalidates automatically. Never
mirror that data in enums, constants, or Inertia props, and never add a `locations` table.

**`GENERAL` is a sentinel, not a row.** Regions and notes store `'GENERAL'` as `NULL` in the
database. Frontend forms should use `GENERAL_ID` from `composables/useGameData.ts`.

## Inspecting things

```bash
php artisan route:list                                  # all routes
php artisan route:list --except-vendor
php artisan route:list --path=runs
php artisan config:show database.default
php artisan about
```

In tinker, use single quotes for the outer shell argument so `$` isn't expanded:

```bash
php artisan tinker --execute 'App\Models\Run::with("regions", "notes")->count();'
```

Laravel Boost (MCP) is the preferred way to query the database, read logs, and search docs —
`php artisan boost:mcp` starts it, and `php artisan boost:update` refreshes the guidelines and
skills in `.agents/skills/`.

## Project rules

Committed, area-grouped conventions live in `.ai/rules`. Read `.ai/rules/index.md` first, then
the rule file matching the path you're about to touch.
