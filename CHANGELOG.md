Audit remediation log

Audit Issue 1. Testing and CI
Fix. Added Vitest, unit tests, and CI workflow.
Files. package.json, vitest.config.ts, src/lib/validators.test.ts, src/lib/rate-limit.test.ts, .github/workflows/ci.yml

Audit Issue 2. Security and deployment assumptions
Fix. Documented security and deployment expectations.
Files. README.md

Audit Issue 3. Dependency vulnerabilities
Fix. Remediated npm audit findings and enforced audit in CI.
Files. package.json, package-lock.json, .github/workflows/ci.yml

Audit Issue 4. Rate limiting scalability
Fix. Added DB-backed limiter via Prisma, updated all API routes, ensured tests and migration.
Files. prisma/schema.prisma, src/lib/rate-limit.ts, all API routes using rateLimit, vitest.config.ts, src/lib/rate-limit.test.ts

Audit Issue 5. Analytics retention
Fix. Added script to prune analytics events older than 90 days.
Files. src/app/api/analytics/cleanup.ts

Audit Issue 6. Password reset and auth UX
Fix. Added password reset endpoints, token logic, and flow docs.
Files. src/app/api/password-reset/request.ts, src/app/api/password-reset/confirm.ts, src/app/api/password-reset/README.md

Audit Issue 7. Architecture and contributing docs
Fix. Added architecture and contributing sections to README, created CONTRIBUTING.md.
Files. README.md, CONTRIBUTING.md

Audit Issue 8. Accessibility notes
Fix. Added accessibility guidelines and checklist.
Files. ACCESSIBILITY.md
