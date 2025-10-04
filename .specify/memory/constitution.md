<!--
Sync Impact Report
- Version change: 1.4.0 → 1.5.0
- Modified principles:
  * Core Principle VI: Expanded to explicitly require web browser app alongside mobile
  * Added new Core Principle X: Complete Implementation Mandate
- Added sections:
  * Core Principle X: Complete Implementation Mandate (agent must implement all business logic and functionality)
  * Web app constraints in Additional Constraints section
- Removed sections: None
- Templates requiring updates/alignment:
  * ⚠ .specify/templates/plan-template.md (not found in repo)
  * ⚠ .specify/templates/spec-template.md (not found in repo)
  * ⚠ .specify/templates/tasks-template.md (not found in repo)
- Follow-up TODOs:
  * When `.specify/templates/*` are added, include web app requirements and complete implementation checks.
-->

# KidsSavingsAccount Constitution

## Core Principles

### I. Specification-Driven BDD
The project MUST use Behavior-Driven Development focused on user behavior, not
implementation. Specifications MUST:
- Be written in Jest with React Testing Library using Given/When/Then phrasing.
- Organize by user flow: `describe('Page/Component') → describe('User Action') → it('should … when …')`.
- Treat specs as executable contracts: a failing spec blocks merge.
- Include both sunny-day and comprehensive edge cases.
Rationale: Grounding work in user behavior ensures correctness and shared
understanding, reducing rework and regressions.

### II. Correctness and Type Safety Over Speed
Correctness is paramount. The codebase MUST:
- Use TypeScript in strict mode; avoid `any` and unsafe casts; prefer precise types.
- Maintain a robust test pyramid (unit, integration, and critical e2e where needed).
- Enforce meaningful coverage thresholds with risk-based exemptions documented in PRs.
- Prefer clarity over cleverness; surface trade-offs explicitly in reviews and docs.
Rationale: Shipping the right behavior is more valuable than shipping fast but wrong;
types and tests are the primary correctness levers.

### III. Maintainable Next.js Architecture (SOLID, Clean Code)
Architecture MUST align with SOLID and Clean Code principles:
- Clear separation of concerns: UI, state, domain logic, data access isolated.
- Next.js conventions respected (routing, server/client components, data fetching).
- No CSS in JSX/TSX; use reusable style modules or design system components.
- Feature modules are cohesive and independently testable.
Rationale: Predictable structure reduces defects and accelerates safe iteration.

### IV. Security and Secret Management by Default
Security MUST be first-class:
- No hard-coded secrets or environment-specific values; use environment variables and
  secure configuration.
- Validate and sanitize inputs; enforce least-privilege access.
- Keep dependencies updated; address known vulnerabilities before release.
- Follow OWASP-aligned practices for authentication, authorization, and data handling.
Rationale: Early, consistent security practices prevent costly incidents downstream.

### V. Observability and Quality Gates
Operational quality is enforced via automation:
- Linting, formatting, type checks, and tests MUST run in CI and gate merges.
- Instrument critical flows with structured logs and minimal, privacy-safe telemetry.
- Track bundle size and performance budgets for critical pages.
Rationale: Visibility and automated gates sustain reliability as complexity grows.

### VI. Cross-Platform: Web Browser + Mobile with Shared React Core
The project MUST deliver a web application executable in modern browsers AND iOS and
Android mobile apps for store distribution (App Store and Google Play), all consuming
a single shared React codebase.
- Folder structure MUST separate platforms and shared code:
  - `apps/web/` for the Next.js web application (browser-executable)
  - `apps/ios/` for the iOS app project
  - `apps/android/` for the Android app project
  - `packages/react-core/` for shared React UI/business logic
- Shared code is the single source of truth for features; platform-specific code is
  limited to adapters, navigation wrappers, native modules, and packaging.
- The web app MUST be fully functional in modern browsers (Chrome, Firefox, Safari,
  Edge) with responsive design for desktop and mobile viewports.
- An Architecture Decision Record (ADR) MUST select the mobile wrapper strategy:
  - Option A (preferred for performance): React Native sharing logic/components with
    platform adapters (optionally React Native Web for web reuse).
  - Option B: Native WebView wrapper embedding the production React web bundle; the
    performance, offline, and device API trade-offs MUST be documented and mitigated.
- CI/CD MUST build deployable web artifacts and store-ready mobile artifacts (AAB/APK
  for Android, IPA for iOS) when relevant areas change (`apps/*`, `packages/react-core/`).
Rationale: A shared core maximizes correctness and velocity across all platforms;
separate app containers preserve platform-specific concerns and store compliance. The
web version provides broadest accessibility and lowest friction for user acquisition.

### VII. Backendless, Encrypted On-Device Data (Mobile)
Mobile apps MUST NOT depend on any backend service. All app data, including user
information and user content, MUST be stored on-device with strong encryption.
- Data storage MUST use OS-provided secure storage (e.g., iOS Keychain, Android
  Keystore) and encrypted databases/files where applicable.
- Any optional cloud services (e.g., crash reporting) MUST NOT transmit user data or
  personally identifiable information; disable or anonymize by default.
- Network access for feature functionality MUST be disabled; if present for store-
  compliance or diagnostics, it MUST be opt-in, privacy-preserving, and contain no
  user content.
- Threat model and crypto choices (algorithms, key management, rotation) MUST be
  documented in an ADR and validated in code review.
Rationale: Local-only design maximizes privacy, reduces attack surface, and simplifies
compliance.

### VIII. Monetization (Ads-ready + Ad-free Paid Tier)
The apps MUST support monetization via ads in a free tier and an ad-free paid tier.
- UI MUST reserve dedicated, responsive ad slots that never block core functionality
  and collapse gracefully when ads are disabled/unavailable.
- An entitlement/feature flag MUST toggle ads off for paid users; behavior must be
  consistent across iOS and Android.
- Ad requests are permitted as monetization traffic and MUST be data-minimized,
  exclude user content/PII, and comply with store and privacy policies.
- Offline behavior MUST remain fully functional; when offline, ad slots hide or show
  placeholders without errors.
- An ADR MUST document the chosen ad network(s), privacy modes (e.g., contextual vs
  personalized), and compliance settings; reviews MUST verify no PII leakage.
Rationale: Designing for both modes from the start avoids layout rework and ensures a
privacy-respecting revenue path.

### IX. Responsive Mobile-First UI + Viewport Testing
The UI MUST be responsive and work well across phones and tablets.
- Adopt a mobile-first responsive design with clear breakpoints for common phone and
  tablet sizes; layouts MUST avoid horizontal scrolling and maintain touch targets.
- Critical screens MUST include tests across at least: small phone, large phone, and
  tablet viewports. Visual regressions and layout shifts MUST be prevented.
- Ad slots (if present) MUST not overlap core interactions on small screens and MUST
  collapse gracefully.
- Accessibility checks (contrast, hit area sizes, semantics) MUST be included.
Rationale: Ensuring great mobile/tablet UX is essential for store ratings and revenue.

### X. Complete Implementation Mandate
When implementing features, components, or modules, the agent MUST deliver complete,
production-ready code with all business logic and app functionality fully implemented.
- NO placeholders, stubs, or "TODO: implement later" comments are permitted in
  committed code unless explicitly part of a phased delivery plan documented in an ADR.
- All user-facing features MUST be end-to-end functional: UI interactions trigger real
  business logic, state updates persist correctly, and edge cases are handled.
- Business logic MUST be complete, tested, and ready for production use.
- If complexity requires phasing, document the MVP scope explicitly and implement that
  scope completely before moving forward.
Rationale: Partial implementations create technical debt, confusion, and integration
risk. Complete implementation ensures every commit delivers usable value and maintains
system integrity.

## Additional Constraints for Specifications and Testing

- Language/Framework: TypeScript with Next.js/React.
- Testing Stack: Jest + React Testing Library.
- Style: BDD Given/When/Then; focus on observable behavior, not internals.
- Structure: Group tests by feature area and user flow using nested `describe` blocks.
- Mandatory spec elements per file:
  1) Concise summary,
  2) Detailed purpose and adjacency to related components/specs,
  3) Sunny use case (happy path),
  4) Edge cases (comprehensive, risk-prioritized).
- Naming conventions:
  - Test files: `[feature].spec.tsx`.
  - Test names: `it('should [expected behavior] when [condition]')`.
- Anti-patterns to avoid:
  - DO NOT add CSS inside JSX/TSX; use dedicated, reusable style modules.
  - DO NOT hard-code sensitive data; use environment variables and secure config.

Viewport testing constraints:
- Provide test coverage for small phone (~360x640), large phone (~414x896), and tablet
  (~768x1024) viewports for critical flows.
- CI MUST run viewport tests and block merges on failures.

Web app constraints:
- Repository MUST contain `apps/web/` with a Next.js application.
- The web app MUST be fully functional in modern browsers without requiring mobile
  device features.
- Shared React logic and UI components live in `packages/react-core/` and are imported
  by the web app (and mobile apps where applicable).
- Web-specific behaviors (e.g., browser storage, responsive breakpoints) are isolated
  behind adapters and do not fork shared business logic.
- The web app MUST support responsive design for desktop, tablet, and mobile browser
  viewports.

Mobile-specific constraints:
- Repository MUST contain `apps/ios/`, `apps/android/`, and `packages/react-core/`.
- Shared React logic and UI components live in `packages/react-core/` and are imported
  by both mobile apps (and web where applicable).
- Platform-specific behaviors are isolated behind adapters and do not fork shared
  business logic.

Backendless and encryption constraints (mobile):
- No backend endpoints may be required for core features; apps must function fully
  offline.
- All persisted data MUST be encrypted at rest; secrets/keys MUST use secure enclave /
  keychain/keystore APIs; NEVER store secrets in plaintext or code.
- Telemetry/crash analytics, if enabled, MUST be data-minimized and contain no user
  content or PII; default to disabled.

Monetization constraints (mobile):
- Reserve UI space for ads with responsive layouts; when ads are disabled/unavailable,
  render placeholders or collapse without shifting critical UI unexpectedly.
- Provide configuration to enable/disable ads (free vs paid) deterministically.
- Ad traffic is allowed despite backendless Principle VII; it MUST not include user
  data and MUST comply with platform privacy policies.

## Development Workflow, Review Process, Quality Gates

- Ambiguity handling: If requirements are unclear, ASK for clarification before
  implementation; document decisions and trade-offs.
- Reviews: Require code review with explicit acknowledgment of surfaced trade-offs and
  risks; block on violations of MUST rules.
- CI gates: type checks, lint, format, tests, and coverage thresholds must pass; add
  integration/e2e tests for risky flows.
- Documentation: Each feature/spec links to adjacent components/specs and records key
  decisions (including trade-offs) in the PR description.

## Governance

The Constitution supersedes other practices. Amendments require:
- A documented proposal describing the change, rationale, and migration plan.
- Version bump per semantic rules below and approval via standard review.

Versioning policy for this document:
- MAJOR: Backward-incompatible changes to principles or governance.
- MINOR: New principle/section or materially expanded guidance.
- PATCH: Clarifications/wording changes without semantic impact.

Compliance:
- All PRs must verify compliance with Core Principles and Quality Gates.
- Complexity must be justified with clear trade-offs and alternatives considered.

**Version**: 1.5.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04
