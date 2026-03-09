# 2. use sveltekit form actions

Date: 2026-03-03

## Status

Accepted

## Context

Sourcing and submitting data can be done in many different ways (SvelteKit actions, Tanstack Query, API endpoints + fetch, etc.).

## Decision

Due to the simplicity of this application in its current state, we will leverage load functions and form actions in Sveltekit for data soucing and submission.

## Consequences

Data fetching and submission becomes more idiomatic to SvelteKit and leverages the benefits of the framework, including isomorphic fetching and type generation.

## Amendment (2026-03-09)

GET `+server.ts` endpoints are acceptable for progressive enhancement use cases that are not form submissions — specifically, typeahead/autocomplete search where client-side debounced fetching provides a significantly better UX than a full page reload. These endpoints must still live inside the `(authed)` route group to inherit authentication guards. This exception does not extend to data mutation endpoints, which continue to use form actions exclusively.
