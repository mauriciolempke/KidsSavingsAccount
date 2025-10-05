# Phase 0 Research: Kids Savings Account Web App

## Decisions

- Tech stack: TypeScript + React with Next.js (SPA via single route), Vite-like DX via Next dev server.
- State management: React Context + Reducers for domain logic; lightweight selectors; no external global state unless needed.
- Persistence: IndexedDB (via idb-keyval) to store ASCII-only "virtual files" keyed by filename; single backup per file maintained as `<name>.bak` entries. Export/Import uses ASCII-only JSON manifest.
- Time handling: Device local time only; monthly anchor at 00:00 local per spec.
- Math: Integer dollars throughout; always round up each step.
- Charts: Recharts (or similar) for Savings line chart; simple progress bar for Goal accounts.
- UI theming: Fintech dashboard aesthetic; responsive, mobile-first.

## Rationale

- Next.js aligns with the constitution and enables SPA behavior within a single route while preserving SSR/optimizations if needed later.
- IndexedDB is the most robust web storage for structured data and larger payloads; we can enforce ASCII-only at the application layer.
- A manifest-based import/export provides atomic, testable flows and maps directly to spec FR-023/024.

## Alternatives Considered

- localStorage only: rejected due to size limits and lack of transactional semantics.
- Service Worker + Cache API: unnecessary for pure data persistence; may be added later for offline-first assets.
- Redux: overkill for the current domain; Context/Reducers suffice.

## UI Inspiration Notes

- Fintech layouts emphasize clear account cards, bold balances, and simple transfer flows.
- Use a neutral palette with accent color for goal progress; large numeric typography.
- Maintain accessible contrast and touch targets per responsive constraints.


