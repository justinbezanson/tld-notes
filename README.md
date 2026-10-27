# TLD Notes

TLD Notes is a Laravel + Inertia Vue application for tracking runs and notes - useful for keeping track of game runs, goals/tasks, and notes about regions or encounters.

## Features

- **Runs** - Create and manage runs (tracks like a play session)
- **Regions** - Track progress through different regions in a run
- **Notes** - Add notes to runs and regions
- **Tasks/Goals** - Add, edit, toggle completion, and delete tasks per run with sorting (incomplete tasks first, oldest first)

## Tech Stack

- [Laravel 13](https://laravel.com) - PHP backend
- [Inertia.js v3](https://inertiajs.com) - SPA without API complexity
- [Vue 3](https://vuejs.org) - Frontend framework
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Pest](https://pestphp.com) - PHP testing
- [Vitest](https://vitest.dev) - Frontend testing

## Requirements

- PHP 8.3+
- Composer
- Node.js 20+ and npm/pnpm
- SQLite (default) or MySQL/Postgres

## Installation

```bash
# Clone the repository
git clone https://github.com/justinbezanson/tld-notes.git
cd tld-notes

# Install dependencies and setup
composer setup
```

The `composer setup` script will:
1. Install PHP dependencies
2. Copy `.env.example` to `.env` if it doesn't exist
3. Generate app key
4. Run migrations
5. Install npm dependencies
6. Build frontend assets

## Development

```bash
# Start the development server (runs Laravel, Vite, queue, logs)
composer dev
```

Or run services separately:
```bash
php artisan serve
npm run dev
```

## Testing

```bash
# Run all tests (PHP + linting + type checking)
composer test

# Run PHP tests only
php artisan test

# Run frontend tests
npm run test
```

## Building for Production

```bash
npm run build
```

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).
