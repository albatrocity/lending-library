# 4. Panda CSS: defineRecipe in Theme vs cva in Components

Date: 2026-03-11

## Status

Accepted

## Context

Panda CSS offers two mechanisms for defining multi-variant styles:

- **`cva`** — a runtime utility imported from `styled-system/css`. It can be called anywhere in source (including inside `.svelte` files) and returns a class-name function. Panda statically analyses `cva` call sites at build time and generates the necessary CSS, but the recipe itself is not registered in the theme and does not appear in the generated `styled-system/` typings.
- **`defineRecipe`** — declares a recipe in `panda.config.ts` (typically by importing it from a file in `src/lib/theme/recipes/`). Panda registers it in the theme, generates a fully typed recipe function under `styled-system/recipes`, and makes it available as a prop-based pattern on JSX/Svelte components via the `styled` factory.

Both approaches produce statically extracted CSS — neither requires a runtime style-injection step.

## Decision

Use **`defineRecipe`** (registered in `panda.config.ts`) for any component whose styles need to be reused across more than one place, or that forms part of the design system (buttons, badges, inputs, etc.).

Recipe files live in `src/lib/theme/recipes/<name>.recipe.ts` and are imported into `panda.config.ts` under `theme.extend.recipes`. Components import the generated recipe from `styled-system/recipes`.

Use **`cva`** only for one-off, component-local variant logic that has no design-system standing and will never be reused.

## Consequences

- `src/lib/theme/recipes/` is the canonical location for all registered recipes.
- `panda.config.ts` grows an import per recipe; keeping recipe files small and focused mitigates this.
- Components import generated recipes from `styled-system/recipes` (e.g. `import { button } from 'styled-system/recipes'`), which are fully typed.
- Inline `cva` usage inside a component file is a signal that the style variant is localised and not part of the shared design system. If a `cva` block is later needed elsewhere, it should be promoted to a `defineRecipe`.
- Recipe files in `src/lib/theme/recipes/` must not import anything from SvelteKit or Svelte (they are evaluated by Panda at build time in a plain Node context).
