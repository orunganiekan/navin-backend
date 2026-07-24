# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added shared `PASSWORD_MIN_LENGTH` / `PASSWORD_MIN_LENGTH_MESSAGE` constants used by all password Zod schemas
- Added `STELLAR_WEBHOOK_SECRET` to `src/env.ts` and HMAC signature tests for `POST /api/webhooks/stellar`
- Added `docs/PAGINATION.md` and shared helpers in `src/shared/utils/pagination.ts` documenting cursor vs offset conventions
- Extended `GET /api/shipments` with `q`, `trackingNumber`, `from`/`to`, and multi-status filters plus text index on trackingNumber/origin/destination
- Created `docs/DATABASE.md` documenting plugin architecture, index optimization strategies, and schema conventions (#309)
- Created `src/shared/plugins/softDeletePlugin.ts` as a reusable Mongoose plugin for soft deletion (#309)
- Added regression test for resolving a non-existent anomaly (#299).

### Changed

- Standardized password `minLength` to 8 across auth and users validation schemas and Swagger
- Captured `req.rawBody` in the global JSON parser so Stellar webhook HMAC verification can sign the exact bytes received
- Telemetry rejects simultaneous `cursor` + `page`; cursor takes precedence; pagination meta stays in `meta`
- Anomaly and telemetry list services use shared `paginateCursor` helper
- Updated shipment search tests and Swagger query params for the new filters
- Updated `docs/swagger.yaml` to decouple request bodies from full response models for shipment routes:
  - Created `CreateShipmentRequest` for `POST /api/shipments` (#310)
  - Created `UploadProofRequest` for `POST /api/shipments/:id/proof` (#310)
  - Created `UpdateShipmentStatusRequest` for `PATCH /api/shipments/:id/status` (#310)
- Refined JSDoc header in `src/shared/plugins/isoDatePlugin.ts` (#309)
- Replaced `new Error()` with `AppError` in `anomaly.service.ts`, `shipments.service.ts`, and standardised error codes in `telemetry.service.ts` / `iot.service.ts` (#257, #258, #255).
- Corrected Swagger response envelope for `GET /api/anomalies` and `PATCH /api/anomalies/{id}/resolve` to match the standard `{ success, message, data, meta? }` shape (#256, #299).
- Removed `any` types from `analytics.service.ts`, `telemetry.service.ts`, `shipments.controller.ts`, and `users.model.ts`.

### Fixed

- Restored missing `organizationsRouter` import in `buildApp` and repaired broken `auth.controller` / Swagger YAML so pagination and search suites can boot
- Confirmed telemetry pagination and battery-threshold anomaly tests assert auth + `data` array envelope correctly

### Security

- Required `x-stellar-signature` on `POST /api/webhooks/stellar` and verified HMAC-SHA256 against `STELLAR_WEBHOOK_SECRET`
- Added inline security comments explaining critical design decisions (using `// SECURITY: [Threat] — This prevents [attack] by [mechanism]` pattern):
  - In `src/shared/middleware/requireAuth.ts` (Bearer formatting, JTI token tracking/revocation checks) (#311)
  - In `src/shared/middleware/verifyStellarSignature.ts` (timingSafeEqual for preventing side-channel attacks) (#311)
  - In `src/modules/users/users.service.ts` (placeholder high-entropy random hashes) (#311)
  - In `src/modules/auth/auth.service.ts` (TTL token expiration, JTI UUID generation) (#311)

### Removed

- Archived `AUDIT_REPORT_*.html` files outside the repository for the current session.
- Deleted stale scrapes / snapshots: `navinmxv`, `Issues.md`, `md`, `documentation md`, and the `issues/` directory (#56–#65).
