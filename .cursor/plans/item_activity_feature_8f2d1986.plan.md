---
name: Item Activity Feature
overview: Add an append-only activity stream table and service, integrate it into the borrow lifecycle, and surface a per-item activity timeline with community-aware actor masking.
todos:
  - id: schema
    content: Add activity enums and activities table to schema.ts
    status: pending
  - id: relations
    content: Wire up activity relations in relations.ts
    status: pending
  - id: zod
    content: Create Zod schemas for activity validation in src/lib/schemas/activities.ts
    status: pending
  - id: service
    content: Create activityService.ts with recordActivity, recordItemActivity, and getItemActivity
    status: pending
  - id: integrate-borrow-requests
    content: Integrate activity recording into borrowRequestsService (create, accept, reject, cancel)
    status: pending
  - id: integrate-borrows
    content: Integrate activity recording into borrowsService (activateBorrow)
    status: pending
  - id: item-detail-load
    content: Add activity data to item detail page load function
    status: pending
  - id: item-detail-ui
    content: Add activity timeline UI to item detail page
    status: pending
  - id: migration
    content: Generate and apply Drizzle migration
    status: pending
  - id: adr
    content: Add ADR for activity stream pattern
    status: pending
  - id: agent-rules
    content: Update CLAUDE.md and AGENTS.md with activity tracking guidance
isProject: false
---

# Item Activity Feature

## Schema: `activities` table

Add to `[src/lib/server/db/schema.ts](src/lib/server/db/schema.ts)`:

- New enums: `actorType` (`user`, `system`), `activitySubjectType` (`item`), `activityType` (`requested`, `accepted`, `rejected`, `cancelled`, `borrowed`, `returned`), `activityRelatedType` (`borrowRequest`, `borrow`)
- New table `activities`:

```
id            serial PK
actorId       text NOT NULL              -- user.id is text (Better Auth)
actorType     actorType NOT NULL
subjectId     integer NOT NULL           -- item PK is integer, matches images pattern
subjectType   activitySubjectType NOT NULL
activityType  activityType NOT NULL
communityId   integer NOT NULL → communities.id
relatedId     integer nullable           -- links to the triggering borrow_request or borrow
relatedType   activityRelatedType nullable
message       text nullable
occurredAt    timestamp NOT NULL defaultNow
metadata      jsonb nullable
```

Indexes on: `(subjectId, subjectType)`, `(actorId, actorType)`, `communityId`, `occurredAt`.

## Design decision: communityId resolution

Borrow requests don't currently carry a `communityId`. An item can be in multiple communities, and the borrower may share more than one with the item.

Proposed approach: **fan-out**. When an activity event occurs, insert one row per community the item is available in. This ensures:

- Members of community A see the event with full actor details
- Members of community B (which also has the item) see it from their own community context
- The query stays simple: filter by subjectId, then mask based on viewer's memberships

The trade-off is more rows, but activity tables are append-only and the cardinality (items-per-community) is low. The alternative -- picking a single community or making communityId nullable -- creates ambiguity in the masking logic.

## Relations

Update `[src/lib/server/db/relations.ts](src/lib/server/db/relations.ts)` to add:

- `activities.actor` -> one user (where actorType = 'user')
- `activities.community` -> one community
- Items relation: `items.activities` -> many activities (via subjectId where subjectType = 'item')

## Service: `activityService.ts`

New file at `[src/lib/server/services/activityService.ts](src/lib/server/services/activityService.ts)`:

- `recordActivity(params)` -- inserts a single activity row. Accepts actor, subject, type, communityId, optional related/message/metadata.
- `recordItemActivity(params)` -- convenience wrapper that fans out: looks up the item's communities, inserts one row per community. Accepts a `tx` (transaction handle) so it can participate in the caller's transaction.
- `getItemActivity(itemId, viewerUserId)` -- returns the activity timeline for an item, with actor names conditionally masked. Deduplicates fan-out rows so the viewer sees each logical event once (preferring the row from their own community for actor name visibility).

### Query for `getItemActivity`

Uses the Drizzle query builder (not relational API) to do a LEFT JOIN on `community_memberships` for the viewer, then conditionally exposes or masks `user.name`:

```sql
SELECT DISTINCT ON (a.occurred_at, a.activity_type, a.actor_id)
  a.*,
  CASE WHEN cm.user_id IS NOT NULL THEN u.name ELSE 'Someone' END as actor_name
FROM activities a
LEFT JOIN "user" u ON a.actor_id = u.id AND a.actor_type = 'user'
LEFT JOIN community_memberships cm
  ON cm.community_id = a.community_id AND cm.user_id = :viewerId
WHERE a.subject_id = :itemId AND a.subject_type = 'item'
ORDER BY a.occurred_at DESC, a.activity_type, a.actor_id, cm.user_id DESC NULLS LAST
```

The `DISTINCT ON` with the `NULLS LAST` ordering ensures that when fan-out produces duplicates, the row from the viewer's own community (with the unmasked name) wins.

## Zod schema

New file at `[src/lib/schemas/activities.ts](src/lib/schemas/activities.ts)`:

- `createActivitySchema` -- validates service input
- Discriminated union on `activityType` for metadata shape validation (can start simple and extend)

## Integration into existing services

### `[src/lib/server/services/borrowRequestsService.ts](src/lib/server/services/borrowRequestsService.ts)`

Modify these functions to call `recordItemActivity` inside their existing transactions (or wrap in a new transaction where one doesn't exist):


| Function              | Activity type | Message                                |
| --------------------- | ------------- | -------------------------------------- |
| `createBorrowRequest` | `requested`   | "{actor} requested to borrow {item}"   |
| `acceptBorrowRequest` | `accepted`    | "{actor} accepted the borrow request"  |
| `rejectBorrowRequest` | `rejected`    | "{actor} rejected the borrow request"  |
| `cancelBorrowRequest` | `cancelled`   | "{actor} cancelled the borrow request" |


Each call passes the borrow request ID as `relatedId` with `relatedType: 'borrowRequest'`.

### `[src/lib/server/services/borrowsService.ts](src/lib/server/services/borrowsService.ts)`


| Function         | Activity type | Message                     |
| ---------------- | ------------- | --------------------------- |
| `activateBorrow` | `borrowed`    | "{actor} received the item" |


Passes the borrow ID as `relatedId` with `relatedType: 'borrow'`.

Note: `acceptBorrowRequest` already creates the borrow row in a transaction. The `accepted` activity covers that transition; `borrowed` covers the separate delivery confirmation.

### Actor context

The existing service functions don't receive a `userId` for the actor -- they only take the entity ID. We'll need to thread the actor's userId into these calls. Two options:

1. **Add userId parameter** to `acceptBorrowRequest(id, actorId)`, etc.
2. **Look up the actor** from the borrow request / borrow inside the function.

Option 1 is cleaner and avoids extra queries. The calling `+page.server.ts` actions already have `user.id` from the session.

## UI: item activity timeline

### Route: `[src/routes/(authed)/items/[id]/+page.server.ts](src/routes/(authed)`/items/[id]/+page.server.ts)

Add `getItemActivity(itemId, user.id)` to the `load` function. Return the activity list alongside existing data.

### Page: `[src/routes/(authed)/items/[id]/+page.svelte](src/routes/(authed)`/items/[id]/+page.svelte)

Add an "Activity" section to the item detail page. Render a timeline of events, each showing:

- Actor name (or "Someone")
- Activity type (human-readable label)
- Relative timestamp
- Optional message

## Migration

Run `db:generate` and `db:migrate` after schema changes to produce and apply the Drizzle migration.

## ADR

Add `[doc/adr/0003-activity-stream-pattern.md](doc/adr/0003-activity-stream-pattern.md)` documenting:

- Choice of append-only activity table over event sourcing or query-time derivation
- Fan-out strategy for community-aware visibility
- Polymorphic ID pattern (consistent with existing `images` table)
- **Ongoing obligation**: Any new feature that introduces user-facing state transitions or actions on trackable subjects (items, and eventually users or communities) must record activity via `activityService`. New `activityType` enum values and metadata shapes should be added as needed. This is not optional -- the activity stream is a core cross-cutting concern, not an afterthought.

## Agent rules: CLAUDE.md and AGENTS.md

Both files currently instruct agents to read ADRs and adhere to architectural decisions. Add a specific callout so agents don't need to infer this obligation from the ADR alone:

> When implementing new features that involve state changes on items (or other trackable subjects), record activity events using the `activityService`. See ADR 0003 for the activity stream pattern. New activity types should be added to the `activityType` enum and integrated into the relevant service functions.

This goes in both `[CLAUDE.md](CLAUDE.md)` and `[AGENTS.md](AGENTS.md)`, below the existing first paragraph (before the MCP tools section).

