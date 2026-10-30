# Design

## Context

See `proposal.md` for motivation. The current repository is a React/TypeScript/Vite SPA with
mock data, browser-only form state and no server or database. I0 added frontend test, lint,
typecheck, formatting, dependency/secret scanning and build checks; no backend integration
test or product API exists. The approved target remains a separate Java/Spring Boot REST
service and MySQL 8. Feature specs, ADRs, the data model and OpenAPI under `specs/` identify
business/security decisions still pending; this design does not silently resolve them. On
2026-10-29 the NGO answered that the product is a catalogue + expression of interest, with
manual evaluation, two animal states, 1–3 photos, one administrator, no roles and no detailed
administrative history. See `specs/decisions/ADR-005-escopo-catalogo-e-interesse.md`.

## Goals / Non-Goals

**Goals:**

- Deliver a staged, testable transition from the observed prototype to a real adoption
  service, with a single persistent source of truth and server-side authorization.
- Preserve the current visual identity and React application; isolate API/data concerns
  behind frontend services and typed DTOs.
- Make security, privacy, accessibility and operational validation part of each increment.
- Keep operational behavior, OpenAPI and OpenSpec requirements synchronized.

**Non-Goals:**

- Implement or claim an API, database, storage, email integration, authentication or deploy
  in this diagnostic change.
- Rewrite the frontend, select pending business policies, enable GitHub protections or claim
  WCAG/LGPD/OWASP certification.
- Add dependencies or change application behavior during the diagnostic phase.

## Decisions

### Preserve the approved system boundary

Keep the browser as a React SPA; introduce a separate Spring Boot REST/JSON API over HTTPS;
let that service alone access MySQL 8. This follows ADR-001/002/003 and prevents browser
credentials and authorization logic from being treated as server controls. A modular
monolith organized by animal, adoption, authentication and shared responsibilities is a
smaller initial operating burden than separate microservices; do not over-abstract without
measured scale.

### Establish database/domain contracts before mutation endpoints

Derive entities from `specs/contracts/data-model.md`: Animal, AnimalImage, AdoptionRequest
and Administrator. ContactMessage exists only if approved delivery/retention requires a
stored record. Approved so far: Animal has exactly `AVAILABLE`/`ADOPTED`; each animal has 1–3
photos; AdoptionRequest collects name, WhatsApp, city and e-mail and has no status workflow;
there is one Administrator without roles; no detailed administrative history. Still approve
remaining fields, visibility, access, retention and logging before schema creation. Use
foreign keys and versioned migrations; publish DTOs, not JPA entities. Keep MySQL access in
repositories behind application/domain rules. Agree on ID format, age representation,
animal archive/delete, image storage/limits, PII retention, and Contact delivery before
making those decisions durable.

**Migration tool selected:** Flyway with versioned SQL is authorized for the future
Spring Boot/MySQL service. This does not approve any business schema or create migrations.
MySQL DDL commonly commits implicitly; do not claim a migration is transactionally
reversible. Validate clean install and supported upgrades in CI, use a dedicated migration
identity, prefer expand/contract and forward-fix, and test backup/restore. Destructive
schema/data changes require explicit approval and a recovery plan.

### Implement the approved initial authentication boundary

The responsible technical owner approved the initial design on 2026-10-29; see
`specs/decisions/ADR-006-admin-authentication.md`. Use one externally provisioned administrator
with username and BCrypt hash in environment/secret configuration, a revocable server-side
`HttpSession`, same-site frontend/API through a proxy, CSRF token header, exact CORS allowlist,
and 15-minute idle expiry. Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` by
default; login rotates the session identifier. Ten failed logins per client IP in ten minutes
trigger a 15-minute cooldown.

The session and rate limiter live in process memory. This increment supports one application
instance only; restarts invalidate sessions and multiple replicas are unsupported. No default
credential, auto-registration, database administrator record, password recovery, or password
change flow is introduced. Production domain, HTTPS, proxy configuration, secret manager and
trusted client-IP handling remain operational gates. Do not implement the previous bearer/JWT
placeholder. There are no differentiated roles, and every administrative operation remains
authorized server-side; frontend guards are UX only.

### Specify all interactive surfaces and truthful behavior

The `public-experience` capability owns shared navigation/404, destination and action
semantics, links and static claims, share fallback, language/indexing metadata, keyboard
operation, focus, and viewport behavior. Product capabilities own the specific remote
loading/empty/error/success states for their data. Every interaction ID in
`docs/diagnostics/INTERACTION_INVENTORY.md` maps to a capability/task or an explicit
business-scope decision in the architecture review. Unapproved donation/volunteer routes,
metrics, filters, status values, and workflow stages remain out of implementation scope.

### Make public submissions truthful and retry-safe

Create adoption success states only from a real accepted server response. The contact form is
outside the first increment. Keep form data on failure. Decide duplicate/retry semantics and
anti-abuse limits before public POST endpoints; use database transactions to bind an adoption
request to an animal that is still `AVAILABLE` at the moment of persistence. The intake
collects name, WhatsApp, city and e-mail and MUST NOT persist the prototype message field.
Public APIs expose only approved fields; administrative reads of PII require an explicit
server-side authorization even with a single administrator.

### Isolate frontend transport

When backend endpoints exist, introduce a small HTTP service/adaptor boundary (for example
under `src/app/services/`) with typed request/response DTOs, input conversion, centralized
HTTP error mapping and cancellation/timeout behavior. Pages own loading/empty/error/success
orchestration; visual components receive props and do not call HTTP or decide authorization.
No data in `src/app/data/animals.ts` is silently substituted after a network error.

### Uploads use a separately approved storage boundary

The browser may preview a selected image, but production persistence must verify actual
content, allowed formats and limits on a trusted service. Keep image metadata associated
with Animal and bytes in a separately approved isolated storage provider unless a later ADR
justifies another storage design. Never treat a free-form URL, extension, client MIME value
or local Base64 preview as a validated uploaded image. Provider and policy are a pre-I4
decision gate.

### Validate incrementally with evidence

I0 wired the current frontend quality checks. Approved future tools are Maven Wrapper,
JUnit 5, Spring Boot Test, Testcontainers/MySQL 8 and Flyway; no backend build or tests exist.
Redocly CLI 2.72.0 is a versioned OpenAPI validator candidate, pending approval for CI. CI
must use the formatter's verified no-write check mode, not the writing command. Each
increment owns tests and docs for its changes. API integration tests exercise authorization,
validation, transitions and persistence; frontend tests cover forms/states/accessibility;
end-to-end tests cover public and admin journeys. Exercise a real MySQL-compatible test
environment for migrations/constraints. Use static/accessibility tooling as evidence, not
as a substitute for keyboard, screen-reader and viewport reviews. Playwright remains a
candidate to evaluate; rules and operational thresholds remain subject to relevant approvals.

## Approval gates before implementation

These are decisions that can change the requirements or task breakdown, not implementation
defaults: (1) identity/session protocol and single-administrator lifecycle; (2) animal
publication, visibility of adopted animals and delete/archive behavior; (3) duplicate
requests, anti-abuse limits and staff response; (4) privacy notice, legal basis, retention and
deletion of PII; (5) image formats/limits/storage; (6) contact delivery and retention (form
deferred); (7) final authentication/topology, origins, runtime/hosting, secret-store and
backup/restore operation; (8) OpenAPI validator approval for CI and operational quality
thresholds. Roles are not a gate because the NGO confirmed there is one administrator without
differentiated roles.
Java/Spring (conditional), Maven Wrapper, Flyway, backend test stack, Docker, GitHub Actions
and RFC 9457 are selected as recorded in the I1 approval register; Spring Boot 4.1.2 must be
revalidated before I2.
Record each decision in `specs/decisions/` and reconcile affected specs/OpenAPI before its
dependent increment. No operational PII or public production release before its controls
are accepted.

## Risks / Trade-offs

- [The initial prototype can be mistaken for an operational application] → Label demo
  authentication and form/CRUD behavior clearly; do not expose as a live intake/admin
  system until backend criteria pass.
- [Migration or delete policy can orphan adoption history] → approve retention/reference
  rules first; use non-destructive migration and archive strategy until decided.
- [Cross-origin hosting changes cookie/CSRF/CORS behavior] → decide production topology in
  auth ADR, test browser credentials and exact origin allowlists before release.
- [Images can exhaust resources or serve malicious content] → gate upload feature on
  content validation, quotas, storage isolation and failure tests.
- [PII in requests/logs can create LGPD and trust harm] → minimize fields, restrict
  resource-level access, approve lifecycle and verify redacted logs before intake rollout.
- [Old documents overstate status and cause false acceptance] → link this diagnosis from
  planning reviews and correct/supersede historical status claims in a separately reviewed
  documentation task.
- [Static audit cannot prove viewport or runtime behavior] → make browser, device, keyboard,
  screen-reader and integration evidence release criteria at I11.

## Migration Plan

1. Establish CI/quality evidence (I0).
2. Record approvals or explicit blockers and align the implementable portions of model/
   OpenAPI/capabilities (I1); blocked business fields remain excluded.
3. After I2 authorization and Boot compatibility recheck, scaffold the separate backend.
   Introduce schema/migrations only in I3 after domain approval.
4. Implement approved identity/session and authorization before any admin reads/writes (I4).
5. Deliver protected animal administration, then image storage, then public catalogue and
   shared experience (I5–I7).
6. Deliver public adoption intake and read-only staff request management after their
   PII/anti-abuse policies are approved (I8–I9). The contact form remains deferred until
   ONG-07 is approved (I10).
7. Exercise integrated flows, WCAG/responsive criteria, security review, deployment,
   backup/restore and operational evidence (I11).

Keep existing in-memory demo behavior clearly distinguished during development; do not
quietly switch an environment from real API to mocks after failure. Production cutover
requires explicit approval, protected credentials, data handling and backup/restore evidence.
Rollback disables writes/routes or restores the previous frontend without destructive
database rollback; forward-compatible migrations and a tested backup are prerequisites for
schema recovery decisions. MySQL DDL rollback is not assumed to be available.
