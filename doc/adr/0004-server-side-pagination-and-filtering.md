# 4. Server-side pagination and filtering

Date: 2026-03-10

## Status

Accepted

## Context

The `/items` browse page needs to display items from all communities a user belongs to. This dataset can be large, and users need to filter by tag, community, owner, title search, and availability. Client-side pagination and filtering would require loading all items upfront, which does not scale.

## Decision

We use server-side pagination and filtering via URL search params and SvelteKit load functions:

- **Pagination**: `?page=N` with a fixed page size. The service function uses SQL `LIMIT`/`OFFSET` and returns a total count alongside the results.
- **Filtering**: Each filter maps to a URL search param (`?tag=`, `?community=`, `?owner=`, `?q=`, `?available=`). The load function parses these and passes them to the service, which builds the appropriate SQL `WHERE` clause.
- **Typeahead search**: Owner search uses a `GET +server.ts` endpoint (`/users?q=`) for debounced client-side fetching, consistent with the existing `/tags?q=` pattern (see ADR 0002 amendment).
- **UI components**: Ark UI headless components (Combobox, Pagination, Checkbox) are used for filter controls, consistent with ADR 0003.

## Consequences

- Filter state is URL-driven, making pages bookmarkable and shareable.
- The pattern works without JavaScript (GET form submission) and with JavaScript (combobox typeahead, client-side URL updates).
- New filterable list pages should follow this same pattern: URL params → load function → service with `LIMIT`/`OFFSET` → return `{ items, total, page, limit }`.
