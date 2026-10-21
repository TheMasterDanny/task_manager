# Tasks

A Kanban-style task manager that runs entirely in the browser. Organize tasks across columns, drag them between stages, and pick up where you left off: everything is saved locally, no account needed.

**Live app:** https://themasterdanny.github.io/task_manager/

## Features

- **Board view** with four columns: To do, In progress, Review and Done
- **Drag and drop** cards between and within columns
- **List view** that groups tasks by status
- **Priorities** (high, medium, low) and an optional due date and time; tasks due today or earlier are marked urgent
- **Search and filter** by title and priority
- **Mark as done** with one click; unchecking returns the task to its previous column
- **Responsive**: on phones the board shows one column at a time with tabs, and the task form opens as a bottom sheet
- **Saved automatically** in your browser's localStorage

> Tasks are stored per browser and device. Clearing your browser data removes them, and they don't sync between devices.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for development and builds
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [Zustand](https://zustand.docs.pmnd.rs) for state, with its `persist` middleware for localStorage

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

| Script | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Type-checks and builds for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |

## Project structure

```
src/
├── App.tsx               # Page layout, search/filter/view state, task dialog
├── index.css             # Tailwind import, design tokens (@theme) and base styles
├── components/
│   ├── Header.tsx        # Title, task count, "New task" button
│   ├── Toolbar.tsx       # Search, priority filter, board/list switch
│   ├── TaskDialog.tsx    # Add / edit task form
│   ├── board/            # Board, columns, cards, phone column tabs, drag and drop
│   ├── list/             # List view
│   └── ui/               # Button, Select, icons, shared task pieces
├── lib/
│   ├── dates.ts          # Due date formatting
│   └── styles.ts         # Class name helpers, tone and priority classes
└── store/
    ├── useConfigStore.ts # Columns and priorities
    └── useTaskStore.ts   # Tasks and actions, persisted to localStorage
```

## Styling

The design tokens live in the `@theme` block in [`src/index.css`](src/index.css), so they're available as Tailwind classes:

- Colors: `bg-surface`, `text-ink`, `text-ink-soft`, `border-line`, `bg-brand`, `text-urgent`
- Column tones: `bg-lilac`, `text-sky-ink`, ... plus `tone-lilac` / `tone-sky` / `tone-peach` / `tone-mint`, which set `bg-tone` and `text-tone-ink` for everything inside a column
- Priority chips: `bg-high-bg text-high-ink`, `bg-medium-bg text-medium-ink`, `bg-low-bg text-low-ink`
- Fonts: `font-display` (Bricolage Grotesque), `font-body` (Figtree)
- Radii and shadows: `rounded-col`, `rounded-card`, `rounded-ctl`, `shadow-card`
- Breakpoints (mobile-first): `tablet:` from 701px, `desktop:` from 1101px

## Deployment

The app deploys to GitHub Pages through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`. Production builds use the `/task_manager/` base path (set in [`vite.config.ts`](vite.config.ts)); the dev server stays at `/`.

To set it up on a fork, go to **Settings → Pages → Source** and choose **GitHub Actions**, then update `base` in `vite.config.ts` to match the repository name.
