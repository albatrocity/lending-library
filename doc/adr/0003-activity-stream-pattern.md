# 3. Activity stream pattern

Date: 2026-03-10

## Status

Accepted

## Context

Users need to see the history of activity for an item to assess its worthiness — how often it's been borrowed, returned, requested, etc. This activity crosses community boundaries: a user can see all activity for an item they have access to, but actor names are only visible for events that occurred within a community the viewer belongs to.

We considered several approaches:

- **Query-time derivation**: reconstruct a timeline by unioning `borrow_requests`, `borrows`, and other tables. Avoids duplication but produces fragile, complex queries that degrade as source tables grow.
- **Domain-specific event tables** (`item_events`, `borrow_events`): stronger typing per domain but still requires `UNION ALL` for a unified timeline.
- **Formal event sourcing**: events as source of truth with materialized projections. Powerful but disproportionately complex for this application's scale.
- **Append-only activity stream table**: a single denormalized log alongside the source-of-truth domain tables.

## Decision

We use an **append-only activity stream table** (`activities`) with polymorphic actor/subject/related references. This follows the same polymorphic ID pattern already established by the `images` table (`imageableType`/`imageableId`).

Key design choices:

- **Fan-out on write**: when an activity event occurs, one row is inserted per community the item belongs to. This makes the read-side query straightforward — filter by `subjectId`, then mask actor names based on the viewer's community memberships.
- **Transactional consistency**: activity inserts participate in the same transaction as the state change they record (e.g., accepting a borrow request and recording the activity are atomic).
- **Actor threading**: service functions that record activity accept an `actorId` parameter from the calling route, rather than looking up the actor internally.

## Consequences

- The `activities` table grows with every state transition. Since it is append-only, this is manageable and indexing on `(subjectId, subjectType)` and `occurredAt` keeps reads fast.
- Fan-out multiplies rows by the number of communities an item belongs to. At current cardinality this is negligible.
- Retroactive backfill is not possible — the log only captures events from the point the feature is deployed.
- The `metadata` JSONB column is flexible but unvalidated at the database level. Application-level validation (via Zod discriminated unions per `activityType`) should be added as the column sees use.
- PostgreSQL enums cannot have values removed, only added. New `activityType` values require an `ALTER TYPE ... ADD VALUE` migration.

## Ongoing obligation

Any new feature that introduces user-facing state transitions or actions on trackable subjects (items, and eventually users or communities) must record activity via `activityService`. New `activityType` enum values and metadata shapes should be added as needed. This is not optional — the activity stream is a core cross-cutting concern, not an afterthought.
