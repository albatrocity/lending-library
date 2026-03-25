# 6. Authenticated User Svelte Context

Date: 2026-03-25

## Status

Accepted

## Context

Several components within the `(authed)` layout subtree need access to the current user's `id` (and potentially other fields) to make owner/borrower comparisons. The naive solution is prop-drilling: each page passes `currentUserId={data.user.id}` into every component that needs it. As the number of such components grows, this becomes noisy and fragile.

Three alternatives were considered:

1. **Prop drilling** — explicit, testable, but verbose. Every parent must thread the prop down.
2. **`$app/state` (`page.data.user`)** — zero setup, but couples UI components to SvelteKit's page data shape and makes unit testing harder (requires mocking `$app/state`).
3. **Svelte context** — scoped to the component subtree, SSR-safe (context is per-request, not a global singleton), type-safe via `createContext`, and decoupled from SvelteKit internals.

## Decision

Use `createContext` (Svelte 5.40+) to expose the authenticated user throughout the `(authed)` layout subtree.

### Context module

`src/lib/contexts/user.svelte.ts` exports a getter/setter pair:

```ts
import { createContext } from 'svelte';
import type { User } from 'better-auth';

export const [getUserContext, setUserContext] = createContext<() => User>();
```

The context value is a **getter function** (`() => User`) rather than the `User` object directly. This avoids the Svelte compiler warning about capturing reactive `$props()` values outside of a derived/closure — the arrow function closes over the reactive `data` prop so callers always read the current value.

### Setting context

`src/routes/(authed)/+layout.svelte` calls `setUserContext(() => data.user)` at the top level of its script block. The `(authed)` layout server load already guarantees `data.user` is a non-null authenticated user.

### Consuming context

Any component inside the `(authed)` subtree can read the user via:

```ts
const getUser = getUserContext();
const currentUserId = $derived(getUser().id);
```

## Consequences

- Components that need the authenticated user no longer require a `currentUserId` prop.
- Adding a new component that needs the user is a one-line import and call.
- This context must **only** be consumed inside the `(authed)` layout subtree. Outside it (e.g. in the public root layout), `user` may be null and `getUserContext()` would return `undefined`.
- Component tests that render components using `getUserContext()` must wrap the component in a parent that calls `setUserContext(...)`. The Svelte testing docs show this pattern using a `Wrapper` function with `mount`.
