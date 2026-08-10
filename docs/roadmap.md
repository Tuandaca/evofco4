# Implementation Roadmap — FC Upgrade Intelligence

> **Version**: 1.0  
> **Date**: 2026-08-10  
> **Total Estimated Duration**: 16-20 weeks

---

## Milestone 0: Infrastructure Setup (Week 1)

### Objective
Establish the development environment and project scaffolding so all developers can run the project locally.

### Features
- [ ] Git repository structure (monorepo)
- [ ] `docker-compose.yml` with PostgreSQL, Redis, volumes
- [ ] `.env.example` with all required variables documented
- [ ] `.NET 10` Web API project skeleton (FCUpgrade.API solution)
- [ ] Next.js 14 project skeleton with TypeScript + TailwindCSS
- [ ] Python FastAPI skeleton with health endpoint
- [ ] Shared `Makefile` / `package.json` scripts for common tasks
- [ ] CI pipeline (GitHub Actions) for lint + build checks

### Dependencies
- Docker Desktop
- .NET 10 SDK
- Node.js 22
- Python 3.11

### Acceptance Criteria
- `docker compose up` starts all 5 services with no errors
- `http://localhost:3000` returns Next.js app
- `http://localhost:5000/health` returns `{ status: "healthy" }`
- `http://localhost:8000/health` returns `{ status: "ok" }`
- GitHub Actions pipeline passes on PR

### Tests
- Docker health checks for all containers
- API integration test: GET /health

---

## Milestone 1: Data Foundation (Weeks 2-4)

### Objective
Establish the database schema, data ingestion pipeline, and seed the platform with initial player/season data.

### Features
- [ ] Entity Framework Core 10 migrations for all entities
- [ ] Seed data: Nations, Leagues, Teams (from static JSON)
- [ ] Nexon Open API integration: `NexonApiPlayerProvider`
- [ ] `StaticJsonFileProvider` for attribute data
- [ ] `ImportJob` tracking in DB
- [ ] Hangfire scheduler for daily Nexon API sync
- [ ] Admin API: `POST /api/v1/admin/import-jobs` (trigger import)
- [ ] Player images proxied from Nexon CDN
- [ ] Season badge images proxied from Nexon CDN

### Dependencies
- Milestone 0 complete
- Nexon Open API key obtained

### Acceptance Criteria
- Database contains 5,000+ PlayerSeason records from Nexon API
- All leagues, teams, nations seeded
- Import job completes in < 10 minutes for full sync
- Player images render correctly

### Tests
- Unit tests: `NexonApiPlayerProvider` (mocked HTTP)
- Unit tests: `StaticJsonFileProvider`
- Integration test: Full import job (test DB)
- Migration tests: Schema integrity

---

## Milestone 2: Core API (Weeks 4-6)

### Objective
Implement all read-only API endpoints for players, seasons, and upgrade statistics.

### Features
- [ ] `GET /api/v1/players` with filtering + pagination
- [ ] `GET /api/v1/players/{id}` with attributes at all levels
- [ ] `GET /api/v1/seasons` list
- [ ] `GET /api/v1/leagues` + teams + nations
- [ ] `GET /api/v1/upgrades/stats/{playerSeasonId}`
- [ ] `GET /api/v1/statistics/overview`
- [ ] Redis caching for all read endpoints
- [ ] OpenAPI/Swagger documentation
- [ ] Rate limiting middleware

### Dependencies
- Milestone 1 complete

### Acceptance Criteria
- All endpoints return correct data
- Response time < 200ms (P95) with cache warm
- Swagger UI accessible at `/swagger`
- Rate limiting correctly returns 429 on breach

### Tests
- Unit tests: All service methods
- Integration tests: All GET endpoints (real PostgreSQL via Testcontainers)
- Performance test: Response time under load

---

## Milestone 3: Frontend — Core UI (Weeks 6-9)

### Objective
Build the public-facing frontend: home page, player browser, and player detail page.

### Features
- [ ] Design system: color palette, typography, spacing
- [ ] Layout: Header + Footer + Navigation
- [ ] Home page: Hero, trending players, platform stats
- [ ] Player list page: Search, filter by position/league/season/OVR, pagination
- [ ] Player detail page: Card display, upgrade level selector, attribute table
- [ ] Season list page
- [ ] Responsive design (mobile-first)
- [ ] SEO: meta tags, OG tags, canonical URLs

### Dependencies
- Milestone 2 complete

### Acceptance Criteria
- All public pages load < 2s (LCP)
- Lighthouse score > 85 on all pages
- Mobile display correct on 375px width
- Search returns results in < 500ms

### Tests
- Jest: Component unit tests
- React Testing Library: Integration tests
- Playwright: E2E tests for core flows

---

## Milestone 4: User Auth + Upgrade Logging (Weeks 9-11)

### Objective
Implement user authentication and the core feature of logging upgrade attempts.

### Features
- [ ] `POST /api/v1/auth/register` + login + refresh
- [ ] JWT middleware in .NET API
- [ ] Login/Register UI pages
- [ ] `POST /api/v1/upgrades` (log upgrade attempt)
- [ ] User upgrade history page
- [ ] Upgrade statistics update after each submission
- [ ] Materialized view refresh on submit

### Dependencies
- Milestone 3 complete

### Acceptance Criteria
- User can register and login
- JWT expires after 15 minutes; refresh token works
- Logged upgrade attempts appear in statistics within 5 minutes
- Personal history shows all past attempts

### Tests
- Unit tests: Auth service
- Integration tests: Register → Login → Submit upgrade flow
- Security test: JWT validation, refresh token rotation

---

## Milestone 5: ML Service — Baseline (Weeks 11-13)

### Objective
Train initial ML models on community upgrade data and expose prediction endpoints.

### Features
- [ ] Data export pipeline: UpgradeAttempt → pandas DataFrame
- [ ] Feature engineering module
- [ ] Baseline model (majority class)
- [ ] Logistic Regression model
- [ ] Random Forest model
- [ ] XGBoost model (primary)
- [ ] Model evaluation + metrics storage
- [ ] `POST /predict/upgrade` endpoint in FastAPI
- [ ] `.NET` ML client: `POST /api/v1/predictions/upgrade`
- [ ] Model versioning (ModelVersion entity)
- [ ] SHAP feature importance

### Dependencies
- Milestone 4 complete (need minimum upgrade data)
- 10,000+ upgrade attempts logged

### Acceptance Criteria
- XGBoost model accuracy > 60% on held-out test set
- Prediction endpoint responds in < 300ms
- Model version stored in DB
- SHAP values returned with each prediction

### Tests
- Unit tests: Feature engineering pipeline
- Unit tests: Model training (smoke test with mock data)
- Integration test: End-to-end prediction flow
- Data leakage check: No temporal leakage in train/test split

---

## Milestone 6: Bait Analysis (Weeks 13-15)

### Objective
Implement the bait sequence analysis feature — a key differentiator from reference sites.

### Features
- [ ] Bait probability model (based on consecutive fail patterns in data)
- [ ] `POST /api/v1/bait/analyze`
- [ ] Bait analysis UI page
- [ ] Sequence input widget (visual fail/success sequence builder)
- [ ] Bait probability gauge with recommendation
- [ ] Community bait statistics by card + level
- [ ] BaitSequence + BaitEvent recording

### Dependencies
- Milestone 5 complete

### Acceptance Criteria
- Bait analysis returns probability score 0-1
- Visual sequence builder works on mobile
- Recommendations are displayed clearly
- Analysis completes in < 1 second

### Tests
- Unit tests: Bait probability algorithm
- Integration tests: Sequence analysis end-to-end
- UX test: Bait UI usability with 5 test users

---

## Milestone 7: Admin Panel (Weeks 15-17)

### Objective
Full admin control panel for data management.

### Features
- [ ] Admin auth guard (role-based)
- [ ] Dashboard: platform stats, error rates, job status
- [ ] Import jobs: trigger, monitor, history
- [ ] Player management: CRUD for players/seasons/attributes
- [ ] User management: view, deactivate, change role
- [ ] ML management: view models, trigger retraining, activate model
- [ ] Data corrections: approve/reject community corrections

### Dependencies
- Milestone 4 complete

### Acceptance Criteria
- Admin can trigger Nexon API import from UI
- Admin can add/edit player attributes
- Admin can activate a different ML model version
- All admin actions are audit-logged

### Tests
- Unit tests: Admin service methods
- E2E tests: Admin import flow, player edit flow

---

## Milestone 8: Statistics + Polish (Weeks 17-19)

### Objective
Advanced statistics, favorites, and production readiness.

### Features
- [ ] Statistics page: charts, heatmaps, filters
- [ ] Favorites: add/remove/list
- [ ] Trending players dashboard
- [ ] Email verification (optional)
- [ ] Password reset flow
- [ ] Sentry error tracking
- [ ] Performance optimization (image optimization, bundle size)
- [ ] WCAG 2.1 AA accessibility audit + fixes
- [ ] Production deployment (Vercel + cloud server)

### Dependencies
- Milestone 7 complete

### Acceptance Criteria
- Statistics charts render correctly with real data
- Favorites sync across devices
- Lighthouse score > 90 on all pages
- Zero P0/P1 accessibility issues
- Production deployed and accessible

### Tests
- Full E2E regression suite
- Load test: 500 concurrent users
- Accessibility audit (axe-core)

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Nexon API rate limits | Medium | High | Cache aggressively; respect ToS limits |
| Insufficient upgrade data for ML | High | High | Seed with synthetic data; set minimum threshold |
| Player attribute data gap | High | Medium | Admin manual entry workflow |
| Bait mechanic not fully understood | Medium | Medium | Community input; statistical analysis |
| Garena VN server different from Nexon | High | Medium | Allow server filter; note limitation to users |
| GDPR / data privacy requirements | Low | Medium | Anonymize all personal upgrade data in public stats |

---

## Technology Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| .NET 10 over Next.js API Routes | Production-grade API, better DI, EF Core | 2026-08-10 |
| Entity Framework Core over Prisma | Native to .NET ecosystem | 2026-08-10 |
| XGBoost as primary ML model | Best accuracy/interpretability balance; not LLM | 2026-08-10 |
| Nexon API as only automated source | Legal compliance; Garena scraping prohibited | 2026-08-10 |
| Redis for caching | Industry standard, low latency | 2026-08-10 |
| Hangfire for scheduled jobs | Integrated with .NET, dashboard UI included | 2026-08-10 |
| Temporal train/test split | Prevent data leakage in upgrade prediction | 2026-08-10 |
