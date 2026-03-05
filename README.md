# 🗂️ File Explorer — Bridgit Senior Frontend Challenge


[![CI](https://github.com/tylerapplin/bridgit-interview/actions/workflows/ci.yml/badge.svg)](https://github.com/tylerapplin/bridgit-interview/actions/workflows/ci.yml)

---

## ✨ Feature Overview

### Core Requirements ✅
| Requirement | Status |
|---|---|
| Part 1 — Basic file listing | ✅ Complete |
| Part 2 — Directory grouping & expand/collapse | ✅ Complete |
| Part 3 — Infinite recursive nesting | ✅ Complete |

### Beyond the Requirements 🚀

| Feature | Details |
|---|---|
| **Lazy loading** | Directories fetch their children on first expand via a scoped `useDirectory` hook — only the visible tree is ever loaded |
| **Virtual scrolling** | `@tanstack/react-virtual` renders only the rows in the viewport, keeping the UI smooth with 10,000+ nodes in `db.json` |
| **Optimistic drag-and-drop** | `@dnd-kit` powers single and batch file moves with instant UI feedback and automatic rollback on failure |
| **Multi-select** | Ctrl+Click for toggle, Shift+Click for range selection; selected items move together on drag |
| **Batch operations** | Selection toolbar exposes "Select All" and bulk delete |
| **Right-click context menu** | Rename, delete, and create new file/folder — all via REST PATCH/DELETE/POST mutations |
| **Live search** | Debounced client-side search with a keyboard-navigable results dropdown; selecting a result auto-expands its ancestor chain |
| **Sorting** | Sort by name or date, ascending/descending, persisted in React context |
| **Loading skeletons** | Animated skeleton rows replace spinners during directory fetches |
| **Clickable breadcrumbs** | Navigate up the tree by clicking any ancestor in the breadcrumb trail |
| **Dark mode** | Full light/dark theme switchable via CSS variables |
| **Internationalisation** | English / French toggle (i18n context with full translation map) |
| **Accessibility** | Semantic HTML, ARIA labels, keyboard navigation, focus management throughout |

---

## 🏗️ Architecture

```
src/
├── components/          # Pure UI components (File, Directory, FileList, SearchBar, …)
├── contexts/            # React Context providers (Expanded, Selection, Sort, Search, i18n, ContextMenu, ActiveNode)
├── hooks/               # Data hooks (useDirectory — React Query + json-server)
├── utils/               # Pure utility functions
└── types.ts             # Shared TypeScript types
```

### Key Design Decisions

- **Lazy, per-directory fetching** — each `Directory` issues its own `useDirectory(id)` query on expand. React Query deduplicates concurrent requests and caches responses for 5 minutes, making re-opens instant.
- **Optimistic mutations** — drag-and-drop and deletes update the React Query cache immediately so the UI feels instant, with full rollback if the server returns an error.
- **Context separation** — expanded state, selection state, sort state, search state, and the active node are each managed in their own slim providers. No monolithic global store; components subscribe only to what they need.
- **Flat API, tree UI** — `json-server` exposes a flat `files` collection filtered by `parentId`. The UI assembles the tree purely through recursive rendering, keeping the API trivially simple and performant.

---

## 🧪 Testing

A full unit test suite covers every component, hook, and context.

```bash
cd view-directory
npm test              # single run (used in CI)
npm run test:watch    # interactive watch mode
```

| Test scope | Files |
|---|---|
| Components | `File`, `Directory`, `FileList`, `Breadcrumbs`, `SearchBar`, `SelectionToolbar`, `SkeletonRow`, `SkeletonList`, `SortControls` |
| Contexts | `ActiveNode`, `ContextMenu`, `Expanded`, `I18n`, `Search`, `Selection`, `Sort` |

---

## ⚙️ CI / CD

GitHub Actions runs three parallel jobs on every push and pull request to `main`:

- **Lint** — ESLint with React Hooks and React Refresh plugins
- **Build** — Vite production build
- **Test** — Vitest unit test suite

Concurrency is configured to cancel in-progress runs when a new commit is pushed.

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## 🚀 Running Locally

**Prerequisites:** Node 20+

```bash
# 1. Install dependencies
cd view-directory
npm install

# 2. Start the mock REST API (port 3001)
npm run server

# 3. In a second terminal, start the dev server (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> `db.json` ships with ~10,000 nodes to stress-test virtual scrolling performance.

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Language | TypeScript |
| Data fetching | TanStack React Query v5 |
| Virtual scrolling | TanStack React Virtual v3 |
| Drag & drop | dnd-kit |
| Mock API | json-server |
| Testing | Vitest + React Testing Library |
| CI | GitHub Actions |

---

## 📋 Original Challenge

See [`challenge.md`](challenge.md) for the original problem statement.
