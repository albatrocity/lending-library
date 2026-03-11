# 5. Two-Layer Semantic Token Strategy

Date: 2026-03-11

## Status

Accepted

## Context

As the design system grew beyond a single `primary` color, recipes began referencing neutral surface colors (`gray.surface.bg`, `fg.subtle`, `border`, etc.) that had no corresponding tokens. Three approaches were considered:

1. **Raw Tailwind scale values** — e.g. `gray.100` directly in recipes. Simple, but requires hunting down every hardcoded value when dark mode or a new neutral palette is introduced.
2. **Single semantic layer** — define everything in one flat object. Mixes color-specific semantics (hover states per palette) with role semantics (what is "muted text"), making it harder to swap palettes.
3. **Two-layer strategy** — separate color palette tokens from role-based aliases, following the pattern established by Park UI and Chakra UI.

## Decision

Adopt a two-layer semantic token strategy:

### Layer 1 — Color palettes (`src/lib/theme/colors/`)

One file per color, each defining the full variant surface (`solid`, `subtle`, `surface`, `outline`, `plain`) with `base`/`_dark` values backed by Tailwind scale tokens. Currently: `primary` (lime-based) and `gray`.

Recipes and components that are color-palette-aware use `colorPalette.*` references and set `colorPalette: '<name>'` in their base styles, or reference a palette explicitly (e.g. `gray.surface.bg.hover`).

### Layer 2 — Global semantic aliases (`src/lib/theme/tokens.ts`)

Role-based tokens that map UI concerns to the palette layer:

| Token       | Role                             |
| ----------- | -------------------------------- |
| `fg`        | Primary text                     |
| `fg.muted`  | Secondary/supporting text        |
| `fg.subtle` | Tertiary/placeholder text        |
| `border`    | Default border and divider color |
| `error`     | Destructive / validation error   |

These reference Layer 1 tokens (`{colors.gray.*}`) rather than raw Tailwind values. Swapping the neutral palette (e.g. gray → zinc) is a change to `tokens.ts` alone.

Both layers are merged into `semanticTokens.colors` in `panda.config.ts`:

```ts
semanticTokens: {
  colors: {
    ...colors,      // Layer 1: { gray, primary }
    ...globalTokens // Layer 2: { fg, border, error }
  }
}
```

## Consequences

- Recipes reference role tokens (`fg.muted`, `border`) rather than palette tokens (`gray.600`) for role-based concerns. They reference palette tokens directly only when palette-specific behaviour is needed (e.g. input border using `gray.outline.border`).
- Adding a new color palette means creating a new file in `src/lib/theme/colors/` and exporting it from the barrel — no changes to recipes.
- Changing the neutral colour (e.g. gray → slate) means updating `tokens.ts` only.
- The next evolution — if needed — is to also alias the palette tokens in Layer 2 (e.g. `surface.bg: '{colors.gray.surface.bg}'`), which would make recipes fully palette-agnostic. This is not done yet as the current recipe set still references `gray.*` directly.
