# 6. S3-Compatible Image Storage

Date: 2026-03-12

## Status

Accepted

## Context

The application needs to support image uploads for items (and potentially other entities in the future). Several storage approaches were considered:

1. **Local filesystem** — Simple for development but requires shared storage in multi-instance deployments and complicates backups.
2. **Database BLOB storage** — Keeps everything in one place but bloats the database, complicates migrations, and is not cost-effective at scale.
3. **Cloud storage (AWS S3, Cloudflare R2, etc.)** — Industry standard, scalable, cost-effective for binary data, but adds vendor dependency.
4. **Third-party upload services (Uploadthing, Cloudinary)** — Simplified API but adds external service dependency and recurring costs.

The database schema already included a polymorphic `images` table designed to store image URLs and associate them with various entities via `imageableType` and `imageableId` columns.

## Decision

Use S3-compatible object storage with the following architecture:

### Storage Layer

- **Production**: Any S3-compatible service (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.)
- **Local Development**: [Adobe S3Mock](https://github.com/adobe/S3Mock) running via Docker Compose

S3Mock was chosen over MinIO for local development because:
- Lightweight and specifically designed for testing
- Auto-creates buckets on startup (no manual setup)
- Accepts any credentials (simpler configuration)
- No authentication required for object access

This approach provides:
- Identical API for development and production (AWS SDK v3)
- Freedom to switch providers without code changes
- Local development without cloud service accounts

### Implementation Structure

| Component | Responsibility |
| --- | --- |
| `storageService.ts` | S3 client, upload/delete operations, URL generation |
| `imagesService.ts` | Database operations on `images` table |
| `/api/images` endpoint | HTTP interface, authorization, orchestration |

### Polymorphic Images Table

The existing `images` table design is retained:

```
images
├── id (serial)
├── url (text) — full URL to the stored object
├── imageableType (enum: 'items', 'users', 'borrowRequests', 'borrows')
├── imageableId (integer) — references the related entity
├── createdAt, updatedAt
```

This allows attaching images to any entity type without schema changes. The S3 object key is derived from the URL when deletion is needed.

### Configuration

Environment variables control the storage backend:

```
S3_ENDPOINT — S3Mock locally (http://localhost:9090), omit or use region endpoint for AWS
S3_BUCKET — bucket name (auto-created by S3Mock via COM_ADOBE_TESTING_S3MOCK_STORE_INITIAL_BUCKETS)
S3_ACCESS_KEY / S3_SECRET_KEY — credentials (any value works for S3Mock)
S3_REGION — AWS region
```

## Consequences

- **Positive**: Same code works locally and in production; easy to switch cloud providers; images are served directly from object storage (no application bandwidth cost).
- **Positive**: S3Mock in Docker Compose means no external service needed for development, and buckets are auto-created.
- **Positive**: S3Mock serves all objects publicly by default, simplifying local development.
- **Negative**: Requires S3Mock to be running for local development with images (graceful degradation if not available would be a future enhancement).
- **Negative**: Production S3/R2 requires separate bucket policy configuration for public access; alternatively, signed URLs could be generated (not implemented).

### Future Considerations

- Image optimization/resizing (could use a CDN with transformation or a service like imgproxy)
- Signed URLs for private images
- Automatic cleanup of orphaned images
- Support for image uploads during item creation (currently requires item to exist first)
