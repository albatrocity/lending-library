# 3. Use Ark UI for Headless UI Components

Date: 2026-03-09

## Status

Accepted

## Context

The application needs accessible, composable UI primitives (combobox, tags input, dialogs, etc.) that work well with Svelte 5 and SvelteKit. Options considered:

- **Bits UI** — Svelte-native headless library, good Svelte 5 support.
- **Melt UI** — predecessor to Bits UI; builder-based API; less active.
- **Ark UI** — framework-agnostic headless library with first-class Svelte support, backed by Zag.js state machines.
- **Radix UI** — React-only; not applicable.

## Decision

Adopt **Ark UI** (`@ark-ui/svelte`) as the headless UI component library.

Key reasons:

1. **Zag.js state machines** — behaviour is defined as deterministic finite state machines, making complex interactions reliable and well-tested.
2. **Composition via `asChild`** — Ark UI's `asChild` snippet pattern allows customizing rendered elements when needed.
3. **Svelte 5 runes compatibility** — `useCombobox`, `useListCollection`, and similar hooks integrate naturally with `$state`, `$derived`, and `$effect`.
4. **Broad component coverage** — covers the full range of primitives needed (combobox, dialog, select, etc.) from a single dependency.

## Consequences

- The `@ark-ui/svelte` package is added as a runtime dependency.
- Complex interactive components (combobox, tags input, etc.) should use Ark UI primitives rather than being built from scratch.
- Styling is the application's responsibility — Ark UI is unstyled by default.
- Prefer a **single Ark machine** per component. Avoid composing two machines (e.g., TagsInput + Combobox) on shared DOM elements — this leads to manual state synchronisation and reactive loops. Instead, use built-in features like `multiple` on Combobox and render tag pills as plain HTML styled with recipe classes.
