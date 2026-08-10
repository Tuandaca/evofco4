# Project Plan — FC Upgrade Intelligence

> **Lead Architect**: evofco4Agent  
> **Date**: 2026-08-10  
> **Status**: Architecture Complete — Ready for Implementation

---

## Executive Summary

FC Upgrade Intelligence is a production-quality FC Online analytics platform for Vietnamese players. It provides player card data, upgrade probability analysis, bait sequence detection, and ML-based predictions — all in one cohesive platform.

---

## 1. Architecture Summary

### System Overview

```
Next.js 14 Frontend
        ↕ REST API (HTTPS)
.NET 10 Web API (C#)
   ├── PostgreSQL 16 (primary DB)
   ├── Redis (caching)
   └── Python FastAPI (ML service)
              ↕
   Nexon Open API (external data)
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js 14 + TypeScript + TailwindCSS | SSR/SSG for SEO, modern DX |
| Backend | .NET 10 Web API | Production-grade, EF Core, Hangfire |
| Database | PostgreSQL 16 | ACID, full-text search, JSONB |
| Cache | Redis | Sub-millisecond reads, pub/sub |
| ML Service | Python + FastAPI + XGBoost | Best-in-class ML ecosystem |
| Infrastructure | Docker Compose | Portable, consistent environments |

### Pattern Summary

- **Clean Architecture**: API → Application → Domain → Infrastructure
- **CQRS**: MediatR for command/query separation
- **Provider Pattern**: Decoupled data sources (IPlayerDataProvider)
- **Repository Pattern**: EF Core + Unit of Work
- **Data Leakage Prevention**: Temporal splits in ML training

---

## 2. Database Summary

### Entity Count: 21 tables

**Core Game Data** (5 entities):
- `Nation` — Countries (Brazil, Germany, France...)
- `League` — Football leagues (EPL, Bundesliga...)
- `Team` — Clubs within leagues
- `Season` — Card types (25DP, SPT, IP...)
- `Player` — Real-world footballer (identity)

**Card Data** (5 entities):
- `PlayerSeason` — Specific in-game card version (Player × Season)
- `PlayerPosition` — Multiple positions per card
- `PlayerAttribute` — Stats at each upgrade level (1-10)
- `PlayerTrait` — Card traits
- `PlayerSkill` — Card skills

**Upgrade Domain** (3 entities):
- `UpgradeAttempt` — Every upgrade attempt ever logged
- `BaitSequence` — Analyzed bait patterns
- `BaitEvent` — Individual events in a bait sequence

**ML/Prediction** (2 entities):
- `Prediction` — ML prediction results
- `ModelVersion` — Trained model registry

**Data Management** (3 entities):
- `DataSource` — External API configurations
- `DatasetVersion` — Versioned data imports
- `ImportJob` — Job execution tracking

**User Domain** (3 entities):
- `User` — Platform user accounts
- `FavoritePlayer` — User's saved cards

### Critical Relationship

```
Player (real person)  1 ──── N  PlayerSeason (in-game card)
                                       │
                              1 ──── N  PlayerAttribute (per level)
                              1 ──── N  UpgradeAttempt (history)
```

**Player ≠ PlayerSeason** — A player can have many cards across seasons.

---

## 3. API Summary

### Base URL: `https://api.fcupgrade.vn/api/v1`

| Category | Endpoints | Auth |
|----------|-----------|------|
| Auth | 7 endpoints | Public/JWT |
| Players | 4 endpoints | Public |
| Seasons/Leagues/Nations | 5 endpoints | Public |
| Upgrades | 5 endpoints | Public + JWT |
| Bait Analysis | 3 endpoints | Public + JWT |
| ML Predictions | 3 endpoints | Public |
| Statistics | 3 endpoints | Public |
| User Profile | 5 endpoints | JWT |
| Admin | 14 endpoints | Admin JWT |

**Total**: ~50 REST endpoints

### Authentication: JWT (15 min) + Refresh Token (7 days, rotating)

---

## 4. Data Strategy

### Primary Data Source: Nexon Open API

- **Free, official, legal**
- Provides: Player IDs, Season IDs, Position codes, Player/Season images
- Limitation: No attribute data (speed, shooting, etc.)
- Sync: Daily automated import via Hangfire

### Attribute Data (Critical Gap)

Nexon API does NOT provide player attributes (PAC/SHO/PAS/DRI/DEF/PHY). Solutions:

1. **Phase 1**: Admin manual entry via admin panel
2. **Phase 2**: Community-validated corrections workflow
3. **Phase 3**: Automated statistical inference from upgrade history

### Upgrade Rate Data

- 100% user-contributed (no official source exists)
- Community members log their upgrade attempts
- Platform aggregates into statistical success rates
- ML model learns from accumulated data

### Legal Compliance

- ✅ Nexon Open API: Official, free, ToS-compliant
- ❌ Garena VN scraping: PROHIBITED
- ❌ fo4s.net scraping: NOT PERMITTED
- ✅ Static JSON admin files: Internal, fully controlled

---

## 5. ML Strategy

### Problem Type: Binary Classification

**Input**: Player card features + upgrade context → **Output**: Success probability (0-1)

### Model Pipeline

```
Data Collection (user submissions)
    ↓
Feature Engineering
    ├── ovr_bracket (categorical)
    ├── season_type (categorical)
    ├── upgrade_level (ordinal 1-10)
    ├── consecutive_fails (int)
    └── community_rate (float)
    ↓
Temporal Train/Test Split (NO random shuffle — prevents leakage)
    ↓
Model Training
    ├── Baseline (majority class) → benchmark
    ├── Logistic Regression → interpretable
    ├── Random Forest → feature importance
    └── XGBoost → primary production model
    ↓
Evaluation
    ├── Accuracy, Precision, Recall, F1
    ├── AUC-ROC
    └── Calibration curve
    ↓
Model Registry (ModelVersion table)
    ↓
Prediction API (FastAPI → .NET → Frontend)
```

### Data Requirements

| Phase | Minimum Samples | Expected Accuracy |
|-------|-----------------|-------------------|
| MVP (baseline) | 10,000 | ~60-65% |
| Growth | 50,000 | ~65-70% |
| Mature | 500,000+ | ~70-75%+ |

### Important Constraints

- ❌ LLM NOT used as primary prediction engine
- ✅ Models are explainable (SHAP values)
- ✅ Predictions include confidence intervals
- ✅ Weekly retraining with new data
- ✅ Temporal split prevents data leakage

---

## 6. Frontend Structure

### Routes

```
/ (Home)
├── /players (Player Browser)
│   └── /players/[playerId]/[season] (Player Detail)
├── /seasons (Season List)
├── /upgrade (Upgrade Simulator)
├── /bait (Bait Analysis Tool)
├── /statistics (Platform Statistics)
├── /history (User Upgrade History) [auth required]
├── /favorites (User Favorites) [auth required]
├── /admin/* (Admin Panel) [admin role required]
│   ├── /admin (Dashboard)
│   ├── /admin/players (Player Management)
│   ├── /admin/imports (Import Jobs)
│   └── /admin/ml (Model Management)
└── /login, /register
```

### Rendering Strategy

- **Public pages**: SSR + ISR for SEO and freshness
- **Interactive pages** (upgrade, bait): Client-side for real-time interaction
- **Auth-gated pages**: Client-side with JWT cookie

---

## 7. Risks

| # | Risk | Probability | Impact | Status |
|---|------|-------------|--------|--------|
| R1 | Insufficient upgrade data for ML in early phase | HIGH | HIGH | Mitigated by synthetic data seeding |
| R2 | Player attribute data not available via API | HIGH | MEDIUM | Mitigated by admin manual entry |
| R3 | Nexon API rate limits throttling import | MEDIUM | HIGH | Mitigated by caching + respectful polling |
| R4 | Bait mechanic is probabilistic and hard to model | MEDIUM | MEDIUM | Mitigated by statistical approach vs. deterministic |
| R5 | Vietnam Garena server differs from Nexon Korea | HIGH | MEDIUM | Noted in data docs; server filter in Phase 2 |
| R6 | Legal challenge from game publisher | LOW | HIGH | Using only official Nexon API; no scraping |
| R7 | Low community adoption = low upgrade data | MEDIUM | HIGH | Need marketing/community strategy |

---

## 8. Implementation Roadmap

| Milestone | Duration | Deliverable |
|-----------|----------|-------------|
| **M0**: Infrastructure | Week 1 | Docker + CI + skeletons |
| **M1**: Data Foundation | Weeks 2-4 | DB schema + Nexon import + seed data |
| **M2**: Core API | Weeks 4-6 | All read endpoints + Redis cache |
| **M3**: Frontend Core | Weeks 6-9 | Player browser + detail page |
| **M4**: Auth + Logging | Weeks 9-11 | Login + upgrade submission |
| **M5**: ML Baseline | Weeks 11-13 | Prediction endpoint + XGBoost model |
| **M6**: Bait Analysis | Weeks 13-15 | Bait analyzer + recommendation |
| **M7**: Admin Panel | Weeks 15-17 | Full data management UI |
| **M8**: Polish + Launch | Weeks 17-19 | Stats, favorites, production deploy |

**Total**: ~19 weeks to full production launch

---

## 9. Document Index

| Document | Path | Purpose |
|----------|------|---------|
| Project Audit | [docs/project-audit.md](../docs/project-audit.md) | Repository analysis |
| Data Sources | [docs/data-sources.md](../docs/data-sources.md) | External data research |
| Reference Analysis | [docs/reference-analysis.md](../docs/reference-analysis.md) | fo4s.net functional analysis |
| Product Requirements | [docs/product-requirements.md](../docs/product-requirements.md) | Features & ML requirements |
| Architecture | [docs/architecture.md](../docs/architecture.md) | System architecture |
| Database | [docs/database.md](../docs/database.md) | ERD & schema design |
| API | [docs/api.md](../docs/api.md) | REST API specification |
| Roadmap | [docs/roadmap.md](../docs/roadmap.md) | Implementation milestones |
| Project Plan | docs/project-plan.md | This document |

---

## 10. Next Steps

> **STOP — Do NOT implement yet.**  
> The next action is user approval of this architecture.

Once approved, begin with:

1. **`/create`** workflow to scaffold the monorepo structure
2. Initialize `.NET 10` Web API solution
3. Initialize Next.js 14 frontend
4. Initialize Python FastAPI ML service
5. Write `docker-compose.yml`
6. Set up PostgreSQL migrations (EF Core)
7. Obtain Nexon Open API key at https://open.api.nexon.com

---

*Generated by evofco4Agent — Architecture Phase Complete*  
*2026-08-10*
