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

1. **Zag.js state machines** — behaviour is defined as deterministic finite state machines, making complex interactions (e.g., composing TagsInput with Combobox via shared DOM elements) reliable and well-tested.
2. **Composition via `asChild`** — Ark UI's `asChild` snippet pattern and `mergeProps` allow two machines to share the same DOM element, enabling patterns like a combined tags-input/combobox without custom low-level event wiring.
3. **Svelte 5 runes compatibility** — `useTagsInput`, `useCombobox`, and similar hooks integrate naturally with `$state`, `$derived`, and `$effect`.
4. **Broad component coverage** — covers the full range of primitives needed (combobox, tags input, dialog, select, etc.) from a single dependency.

## Consequences

- The `@ark-ui/svelte` package is added as a runtime dependency.
- Complex interactive components (combobox, tags input, etc.) should use Ark UI primitives rather than being built from scratch.
- Styling is the application's responsibility — Ark UI is unstyled by default.
- When composing multiple Ark UI machines on a single DOM element (e.g., TagsInput + Combobox), use the `RootProvider` + `asChild` pattern with `mergeProps` to combine event handlers correctly.
