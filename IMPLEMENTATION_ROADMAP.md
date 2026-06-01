# Implementation Roadmap — Fulccrum Production Ready

**Created:** June 1, 2026  
**Total Estimated Time:** 4-6 weeks  
**Dependencies:** Business registration (CAC) runs in parallel

---

## Phase 1: Security Hardening 🔴
**Duration:** 2-3 days  
**Priority:** MUST DO FIRST — blocks everything else  
**Dependencies:** None (can start immediately)

### Day 1: Critical Auth Fixes

| # | Task | File(s) | Time | Risk if Skipped |
|---|------|---------|------|-----------------|
| 1.1 | **Remove JWT secret fallback** — throw error if `JWT_SECRET` env var is missing in production | `backend/src/app.module.ts` | 15 min | Total auth bypass |
| 1.2 | **Fix Apple login** — verify JWT signature against Apple JWKS (use `jose` library) | `backend/src/auth/auth.service.ts` | 2 hrs | Forged logins |
| 1.3 | **Fix Google login** — replace deprecated `tokeninfo` with `google-auth-library` `verifyIdToken()` | `backend/src/auth/auth.service.ts` | 1 hr | Token validation broken |
| 1.4 | **Fix Paystack webhook auth** — exclude `/payment/webhook` from `JwtAuthGuard` (separate controller or decorator) | `backend/src/payment/payment.controller.ts` | 30 min | Payments fail |
| 1.5 | **Verify webhook signature** — ensure `handlePaystackWebhook()` validates HMAC-SHA512 | `backend/src/payment/payment.service.ts` | 1 hr | Fake payment injections |

### Day 2: Data Security

| # | Task | File(s) | Time | Risk if Skipped |
|---|------|---------|------|-----------------|
| 1.6 | **Hash refresh tokens** — store SHA256 hash in DB, compare on validation | `backend/src/auth/refresh-token.service.ts` | 2 hrs | DB breach = all sessions compromised |
| 1.7 | **Remove sensitive console.logs** — strip OTP logging, user data logging in auth flows | `backend/src/auth/auth.service.ts` | 1 hr | OTPs leaked in logs |
| 1.8 | **Add password complexity** — min 8 chars, 1 uppercase, 1 number, 1 special char in `RegisterDto` | `backend/src/auth/dto/register.dto.ts` | 30 min | Weak passwords |
| 1.9 | **Create `.env.example`** — list all required env vars with placeholder values | `backend/.env.example` | 30 min | Dev onboarding friction |
| 1.10 | **Verify `.gitignore`** — ensure `.env`, `node_modules`, `dist`, `uploads` are ignored | `.gitignore` | 15 min | Secrets committed |

### Day 3: Additional Hardening

| # | Task | File(s) | Time | Risk if Skipped |
|---|------|---------|------|-----------------|
| 1.11 | **Add structured logger** — replace `console.log` with NestJS Logger + request IDs | New: `backend/src/common/interceptors/logging.interceptor.ts` | 2 hrs | No production debugging |
| 1.12 | **Add helmet in all environments** (currently prod-only check) | `backend/src/main.ts` | 15 min | XSS/clickjacking |
| 1.13 | **Redis password** in docker-compose | `docker-compose.yml` | 15 min | Open cache access |
| 1.14 | **Rate limit sensitive endpoints** — stricter limits on `/auth/login`, `/auth/register`, `/payment/*` | `backend/src/auth/auth.controller.ts`, `payment.controller.ts` | 1 hr | Brute force |

**Phase 1 Deliverable:** Secure auth system, no exposed secrets, verified external token validation.

---

## Phase 2: Critical Backend Gaps ⚠️
**Duration:** 5-7 days  
**Priority:** Blocks merchant/courier onboarding  
**Dependencies:** Phase 1 complete

### Week 1, Days 4-5: Document Upload System

| # | Task | File(s) | Time |
|---|------|---------|------|
| 2.1 | **Create `Document` Prisma model** — id, userId, type, fileUrl, status, verifiedAt, verifiedBy, rejectionReason | `backend/prisma/schema.prisma` | 30 min |
| 2.2 | **Generate migration** | `backend/prisma/migrations/` | 15 min |
| 2.3 | **Implement `POST /documents/upload`** — multipart form, validate type against allowed document types, upload to S3, save to DB | `backend/src/documents/documents.controller.ts` + `.service.ts` | 3 hrs |
| 2.4 | **Implement `GET /documents/my-documents`** — return user's uploaded docs with status | Same files | 1 hr |
| 2.5 | **Implement `DELETE /documents/:id`** — soft delete, only if not yet verified | Same files | 30 min |
| 2.6 | **Test with frontend** — verify merchant & courier onboarding document upload works | Manual test | 1 hr |

### Week 1, Days 6-7: Admin Document Verification

| # | Task | File(s) | Time |
|---|------|---------|------|
| 2.7 | **Complete `GET /admin/merchants/:id/application`** — return full application with uploaded documents | `backend/src/admin/admin.service.ts` | 2 hrs |
| 2.8 | **Complete `GET /admin/merchants/:id/documents`** — list merchant's documents | Same | 1 hr |
| 2.9 | **Complete `PATCH /admin/merchants/:id/documents/:docId/verify`** — mark verified, update merchant status | Same | 1 hr |
| 2.10 | **Complete `PATCH /admin/merchants/:id/documents/:docId/reject`** — reject with reason, notify merchant | Same | 1 hr |
| 2.11 | **Mirror for couriers** — same endpoints for `/admin/couriers/:id/documents/*` | Same | 2 hrs |
| 2.12 | **Auto-activate on all docs verified** — when all required docs are verified, set merchant/courier status to `active` | Same | 1 hr |

### Week 2, Days 8-9: Business Categories + Misc

| # | Task | File(s) | Time |
|---|------|---------|------|
| 2.13 | **Create `BusinessCategory` Prisma model** | `backend/prisma/schema.prisma` | 15 min |
| 2.14 | **Implement category CRUD** — `GET/POST/PATCH/DELETE /admin/categories` + public `GET /categories` | `backend/src/categories/` | 3 hrs |
| 2.15 | **Seed default categories** — restaurant, grocery, pharmacy, shawarma, etc. | `backend/prisma/seed.ts` | 1 hr |
| 2.16 | **Wire withdrawal execution** — `POST /admin/withdrawals/:id/process` calls Paystack Transfer API | `backend/src/wallet/wallet.service.ts` | 3 hrs |
| 2.17 | **Add transfer webhook handler** — confirm successful bank transfer, update withdrawal status | `backend/src/payment/payment.service.ts` | 2 hrs |

**Phase 2 Deliverable:** Full onboarding flow works (upload docs → admin verifies → account activated). Categories dynamic. Withdrawals execute.

---

## Phase 3: Infrastructure & DevOps 🏗️
**Duration:** 5-7 days  
**Priority:** Required for any deployment  
**Dependencies:** Phase 1 complete (can run parallel to Phase 2)

### Week 2, Days 8-10: Containerization & CI/CD

| # | Task | File(s) | Time |
|---|------|---------|------|
| 3.1 | **Create production Dockerfile** — multi-stage build (install → build → slim runtime) | `backend/Dockerfile` | 2 hrs |
| 3.2 | **Create `.dockerignore`** | `backend/.dockerignore` | 15 min |
| 3.3 | **Production docker-compose** — with env vars, restart policies, health checks, Redis password | `docker-compose.prod.yml` | 1 hr |
| 3.4 | **CI/CD: Build & Test workflow** — lint → type-check → test → build on every PR | `.github/workflows/ci.yml` | 2 hrs |
| 3.5 | **CI/CD: Deploy workflow** — on push to `main`, build image → push to registry → deploy | `.github/workflows/deploy.yml` | 3 hrs |

### Week 2, Days 11-12: Hosting & Domain

| # | Task | Details | Time |
|---|------|---------|------|
| 3.6 | **Choose hosting** — Railway (easiest), Render, or AWS ECS | Decision + setup | 2 hrs |
| 3.7 | **Deploy backend** — first production deployment | Config | 2 hrs |
| 3.8 | **Managed PostgreSQL** — Supabase, Neon, or Railway Postgres | Provision + migrate | 1 hr |
| 3.9 | **Managed Redis** — Upstash or Railway Redis | Provision | 30 min |
| 3.10 | **Domain purchase** — fulccrum.com or alternative | Namecheap/Cloudflare | 30 min |
| 3.11 | **SSL + DNS** — point domain, configure HTTPS | Cloudflare or Let's Encrypt | 1 hr |
| 3.12 | **Configure CORS** — update to production domain | `backend/src/main.ts` | 15 min |

### Week 2, Day 13: Monitoring & Logging

| # | Task | Details | Time |
|---|------|---------|------|
| 3.13 | **Sentry integration** — install `@sentry/nestjs`, add DSN, configure error capture | 2 hrs |
| 3.14 | **Structured logging** — JSON logs to stdout for aggregation | 1 hr |
| 3.15 | **Uptime monitoring** — BetterUptime or UptimeRobot on `/health` endpoint | 30 min |
| 3.16 | **Database backups** — automated daily backup (pg_dump cron or managed DB feature) | 1 hr |
| 3.17 | **Staging environment** — separate deployment for testing before prod | 2 hrs |

**Phase 3 Deliverable:** Backend deployed to production URL with SSL, CI/CD pipeline, error monitoring, automated backups.

---

## Phase 4: External Services 🔗
**Duration:** 1-2 weeks (blocked by business registration)  
**Priority:** Required for full functionality  
**Dependencies:** CAC registration + business bank account

### Can Start Immediately (no business reg needed):

| # | Task | Time | Blocker |
|---|------|------|---------|
| 4.1 | **Firebase production project** — new project, download service account JSON | 1 hr | Google account |
| 4.2 | **Sentry account** — free tier, get DSN | 30 min | None |
| 4.3 | **Google Cloud project** — enable Maps + Places + Distance Matrix APIs | 1 hr | Credit card |
| 4.4 | **Configure Google Maps API key** in backend env | 30 min | 4.3 done |

### Requires Business Registration:

| # | Task | Time | Blocker |
|---|------|------|---------|
| 4.5 | **Paystack live account** — submit CAC, TIN, BVN, bank statement | 3-5 business days | CAC + bank account |
| 4.6 | **Switch to Paystack live keys** — update env vars, test live payment | 2 hrs | 4.5 approved |
| 4.7 | **Enable Paystack Transfers** — for merchant/courier withdrawals | 1 hr | 4.5 approved |
| 4.8 | **Termii account + Sender ID** — submit CAC, register sender ID | 3-5 business days | CAC |
| 4.9 | **Configure Termii** — update env vars, test SMS delivery | 1 hr | 4.8 approved |
| 4.10 | **SendGrid / production email** — configure domain verification | 2 hrs | Domain purchased |
| 4.11 | **Apple Developer Account** — D-U-N-S + $99 fee | 1-2 weeks | D-U-N-S number |

### Business Registration Checklist (parallel task):

```
[ ] Register with CAC (Corporate Affairs Commission)
[ ] Obtain TIN (Tax Identification Number)
[ ] Open business bank account
[ ] Get utility bill for registered address
[ ] Obtain D-U-N-S number (for Apple)
[ ] Prepare director's BVN and valid ID
```

**Phase 4 Deliverable:** Real payments, SMS notifications, push notifications, maps all working in production.

---

## Phase 5: Testing & Documentation 🧪
**Duration:** 5-7 days  
**Priority:** Required for confidence in production stability  
**Dependencies:** Phase 2 complete (features to test exist)

### Week 4, Days 18-20: Core Test Suite

| # | Task | File(s) | Time |
|---|------|---------|------|
| 5.1 | **Setup Jest config** — proper paths, coverage thresholds | `backend/jest.config.ts` | 1 hr |
| 5.2 | **Auth tests** — register, login (success + lockout), OTP verify, refresh, password reset | `backend/src/auth/auth.service.spec.ts` | 4 hrs |
| 5.3 | **Payment tests** — initialize, verify, webhook handling, idempotency, refund | `backend/src/payment/payment.service.spec.ts` (expand) | 3 hrs |
| 5.4 | **Order lifecycle tests** — create → accept → status transitions → complete | `backend/src/orders/orders.service.spec.ts` | 3 hrs |
| 5.5 | **Wallet tests** — credit, debit, balance, withdrawal request | `backend/src/wallet/wallet.service.spec.ts` | 2 hrs |
| 5.6 | **RBAC tests** — verify guards block unauthorized access | `backend/src/common/guards/roles.guard.spec.ts` | 1 hr |

### Week 4, Days 21-22: Integration & E2E

| # | Task | File(s) | Time |
|---|------|---------|------|
| 5.7 | **E2E test setup** — Supertest + test database | `backend/test/app.e2e-spec.ts` | 2 hrs |
| 5.8 | **E2E: Auth flow** — register → verify → login → refresh → logout | Same | 2 hrs |
| 5.9 | **E2E: Order flow** — customer creates order → merchant accepts → courier delivers | Same | 3 hrs |
| 5.10 | **E2E: Payment flow** — initialize → verify → webhook → wallet credit | Same | 2 hrs |
| 5.11 | **WebSocket tests** — connection, room events, message delivery | `backend/test/websocket.e2e-spec.ts` | 2 hrs |

### Week 4, Days 23-24: Load Testing & Docs

| # | Task | Tool | Time |
|---|------|------|------|
| 5.12 | **Load test script** — simulate 500-1000 concurrent users (k6 or Artillery) | `backend/load-tests/` | 3 hrs |
| 5.13 | **Run load test** — identify bottlenecks, fix N+1 queries | N/A | 2 hrs |
| 5.14 | **Swagger/OpenAPI** — install `@nestjs/swagger`, add decorators to key endpoints | Multiple controllers | 4 hrs |
| 5.15 | **API README** — quick-start guide for developers | `backend/README.md` | 1 hr |

**Phase 5 Deliverable:** >70% test coverage on critical paths, load tested to 1K users, API docs accessible at `/api/docs`.

---

## Phase 6: Uber/Glovo Feature Parity (Post-Launch) 🚀
**Duration:** 2-4 weeks  
**Priority:** Post-MVP, for competitive advantage  
**Dependencies:** Phase 1-4 complete, app live

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 6.1 | **Address autocomplete** — integrate Google Places API in frontend | 2 days | High — UX |
| 6.2 | **ETA calculation** — Google Distance Matrix for delivery time estimates | 1 day | High — UX |
| 6.3 | **Subscription plans** (Fulccrum Plus) — free delivery, priority support | 3-4 days | Medium — revenue |
| 6.4 | **Multi-stop delivery** — allow package delivery with multiple drop-offs | 3 days | Medium — feature |
| 6.5 | **Stacked/batched orders** — assign 2-3 nearby orders to one courier | 3 days | High — efficiency |
| 6.6 | **In-app calling** — WebRTC voice call between customer ↔ courier | 5 days | Medium — UX |
| 6.7 | **Fraud detection** — anomaly scoring on orders (velocity, amount, location) | 3 days | High — trust |
| 6.8 | **Driver selfie verification** — verify courier identity before shift | 2 days | Medium — safety |
| 6.9 | **Accessibility (a11y)** — screen reader labels, keyboard nav, contrast | 3-4 days | Medium — inclusivity |
| 6.10 | **Route optimization** — optimal multi-drop route for couriers | 2 days | Medium — efficiency |
| 6.11 | **GDPR data deletion** — user can request full account + data deletion | 1 day | Required — compliance |
| 6.12 | **API versioning** — `/v1/` prefix, deprecation headers | 1 day | Low — future-proofing |

---

## Visual Timeline

```
Week 1:  [███ Phase 1: Security ███][████████ Phase 2: Backend Gaps ████
Week 2:  █████████████████████████][████ Phase 3: Infrastructure ████████
Week 3:  ████████████████████████████████████████████████████████████████]
Week 4:  [████████████ Phase 5: Testing & Docs ████████████████████████████]
Week 5-6: [████████ Phase 4: External Services (blocked by biz reg) ████████]
Post-Launch: [Phase 6: Feature Parity — ongoing]
```

**Parallel tracks:**
- Business registration (CAC, bank account, TIN) — **start Day 1**, takes 2-4 weeks
- Domain purchase — **start Day 1**, takes 1 hour
- Apple Developer enrollment — **start Day 1**, takes 1-2 weeks

---

## Quick Wins (< 30 min each, do anytime)

1. Create `.env.example` with all variables
2. Add Redis password to docker-compose
3. Remove OTP console.logs
4. Set helmet for all environments
5. Add `@ApiTags()` decorators to controllers (prep for Swagger)
6. Add `"engines": { "node": ">=20" }` to package.json

---

## Decision Points

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Hosting** | Railway / Render / AWS ECS / DigitalOcean | **Railway** — easiest for NestJS, built-in Postgres + Redis |
| **Database** | Railway Postgres / Supabase / Neon | **Railway** — same platform, simpler |
| **Email** | SendGrid / Mailgun / AWS SES | **SendGrid** — best free tier (100/day) |
| **Error tracking** | Sentry / Bugsnag / Datadog | **Sentry** — free tier, NestJS plugin |
| **CDN** | Cloudflare / AWS CloudFront | **Cloudflare** — free, also handles SSL + DNS |
| **Log aggregation** | Datadog / Grafana Cloud / Logtail | **Logtail** — free tier, simple setup |

---

## Cost Summary

### Immediate (Month 1):
| Item | Cost |
|------|------|
| Domain (.com) | ~₦15,000/year |
| Railway (Starter) | $5/month |
| Managed Postgres | Included in Railway |
| Redis | Included in Railway |
| SendGrid | Free (100 emails/day) |
| Sentry | Free tier |
| Cloudflare | Free |
| **Total Month 1** | **~₦25,000** |

### After Business Registration (Month 2+):
| Item | Cost |
|------|------|
| Paystack fees | 1.5% + ₦100/transaction |
| Termii SMS | ₦2-4/SMS |
| Google Maps | $200 free credit/month |
| Apple Developer | ₦150,000/year |
| Google Play | ₦38,000 one-time |
| Firebase | Free tier |
| **Total Month 2** | **~₦200,000 (mostly one-time)** |

---

## What I Can Implement Right Now

Without any external service, business registration, or hosting setup, I can immediately implement:

1. ✅ All Phase 1 security fixes (code changes only)
2. ✅ Phase 2 backend gaps (Document model, upload endpoints, category CRUD)
3. ✅ Dockerfile + CI/CD workflow files
4. ✅ `.env.example`
5. ✅ Swagger/OpenAPI setup
6. ✅ Test suite scaffolding
7. ✅ Structured logger

**Want me to start with Phase 1 (security fixes)?**

---

*Roadmap created June 1, 2026*
