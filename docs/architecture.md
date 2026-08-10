# System Architecture — FC Upgrade Intelligence

> **Version**: 1.0  
> **Date**: 2026-08-10

---

## 1. High-Level Architecture

```
                          ┌─────────────────────────────────────────────────────┐
                          │                  CLIENT LAYER                        │
                          │                                                       │
                          │   Browser / Mobile Browser                           │
                          │   Next.js 14 + TypeScript + TailwindCSS             │
                          │   (SSR + SSG for public pages)                       │
                          └───────────────────┬─────────────────────────────────┘
                                              │ HTTPS
                          ┌───────────────────▼─────────────────────────────────┐
                          │                  API GATEWAY                          │
                          │           .NET 10 Web API (C#)                       │
                          │    Controllers → Services → Repositories             │
                          │         JWT Auth | Rate Limiting | CORS             │
                          └──────┬───────────────┬───────────────┬──────────────┘
                                 │               │               │
                  ┌──────────────▼──┐   ┌────────▼────┐   ┌────▼──────────────┐
                  │   PostgreSQL 16  │   │  Redis Cache │   │  Python ML API    │
                  │   (Primary DB)   │   │  (L2 Cache)  │   │  FastAPI + models │
                  └─────────────────┘   └─────────────┘   └────────────────────┘
                                                                    │
                          ┌─────────────────────────────────────────┘
                          │
             ┌────────────▼─────────────────────────────────────────────────────┐
             │              DATA INGESTION LAYER                                  │
             │                                                                    │
             │   Hangfire Jobs (scheduled)                                        │
             │   IPlayerDataProvider (abstracted interface)                       │
             │   ├── NexonApiProvider (primary)                                  │
             │   ├── StaticJsonFileProvider (fallback)                           │
             │   └── ManualAdminProvider (corrections)                           │
             └────────────────────────────────┬─────────────────────────────────┘
                                              │
                          ┌───────────────────▼─────────────────────────────────┐
                          │              EXTERNAL DATA SOURCES                    │
                          │                                                       │
                          │   Nexon Open API (official)                          │
                          │   Nexon CDN (images)                                 │
                          └─────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 3 + shadcn/ui |
| State | Zustand (client) + React Query (server) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Auth | NextAuth.js (optional) or custom JWT cookie |
| Testing | Jest + React Testing Library + Playwright |

### Rendering Strategy

| Route | Strategy | Why |
|-------|----------|-----|
| `/` | ISR (1h revalidate) | SEO + performance |
| `/players` | SSR | Dynamic filters |
| `/players/[id]/[season]` | ISR + client fallback | SEO + freshness |
| `/seasons` | SSG | Rarely changes |
| `/upgrade` | Client-side | Interactive, no SEO needed |
| `/bait` | Client-side | Interactive |
| `/statistics` | SSR | Frequent data changes |
| `/history` | Client-side | Auth-gated |
| `/favorites` | Client-side | Auth-gated |
| `/admin/*` | Client-side | Auth-gated, no SEO |

### Folder Structure

```
apps/web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                   # Home
│   │   ├── players/
│   │   │   ├── page.tsx               # Player list
│   │   │   └── [playerId]/
│   │   │       └── [season]/
│   │   │           └── page.tsx       # Player detail
│   │   ├── seasons/
│   │   │   └── page.tsx
│   │   ├── upgrade/
│   │   │   └── page.tsx
│   │   ├── bait/
│   │   │   └── page.tsx
│   │   └── statistics/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── history/
│   │   └── favorites/
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── players/
│       ├── imports/
│       └── ml/
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── player/
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerCardMini.tsx
│   │   ├── AttributeTable.tsx
│   │   └── UpgradeLevelSelector.tsx
│   ├── upgrade/
│   │   ├── UpgradeStats.tsx
│   │   ├── SuccessRateChart.tsx
│   │   └── BaitIndicator.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── api.ts                         # API client (Axios/Fetch)
│   ├── auth.ts                        # Auth utilities
│   └── utils.ts
└── types/
    ├── player.ts
    ├── upgrade.ts
    └── api.ts
```

---

## 3. Backend Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | .NET 10 Web API (C#) |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL 16 (via Npgsql) |
| Cache | Redis (StackExchange.Redis) |
| Jobs | Hangfire |
| Auth | JWT + Refresh Tokens |
| Validation | FluentValidation |
| Logging | Serilog → Console + File |
| Documentation | Swagger (Swashbuckle) |
| Testing | xUnit + Testcontainers |

### Clean Architecture Layers

```
FCUpgrade.API/               # HTTP layer (Controllers, Middleware)
FCUpgrade.Application/       # Business logic (Commands, Queries, CQRS)
FCUpgrade.Domain/            # Domain entities, interfaces
FCUpgrade.Infrastructure/    # DB, Cache, External APIs, Jobs
FCUpgrade.ML.Client/         # HTTP client for Python ML service
```

### Key Design Patterns

- **CQRS** (Command/Query Responsibility Segregation) via MediatR
- **Repository Pattern** via EF Core + Unit of Work
- **Provider Pattern** for data ingestion (see Section 6)
- **Decorator Pattern** for Redis caching layer
- **Background Jobs** via Hangfire for import tasks

---

## 4. Database Layer

### Primary: PostgreSQL 16

- Managed via **Entity Framework Core 10** migrations
- Connection pooling via **Npgsql PgBouncer**
- Read replicas for reporting queries (Phase 2)
- Backups: Daily snapshots

### Cache: Redis

| Cache Key Pattern | TTL | Data |
|-------------------|-----|------|
| `player:{id}` | 1 hour | Player detail |
| `players:list:{hash}` | 5 min | Search results |
| `upgrade:stats:{playerSeasonId}` | 5 min | Upgrade statistics |
| `upgrade:stats:{playerSeasonId}:{level}` | 5 min | Level-specific stats |
| `statistics:overview` | 10 min | Platform overview |
| `trending:today` | 5 min | Trending players |
| `seasons:all` | 24 hours | Season list |

### Cache Invalidation

- Write-through on `POST /api/v1/upgrades`
- TTL-based expiry for most keys
- Admin panel can flush specific cache keys

---

## 5. ML Service Architecture

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI (Python 3.11) |
| ML Models | scikit-learn + XGBoost |
| Explainability | SHAP |
| Data Processing | pandas + numpy |
| Model Registry | MLflow (Phase 2) |
| Serving | uvicorn |

### ML Pipeline

```
Raw Data (UpgradeAttempt table)
        ↓
   Data Extraction
   (SQL query → pandas DataFrame)
        ↓
   Data Validation
   (pydantic schemas, outlier detection)
        ↓
   Feature Engineering
   ├── ovr_bracket (categorical: 90-100, 101-110, 111-120, 121+)
   ├── season_type (categorical: DP, SPT, IP, ...)
   ├── upgrade_level (ordinal: 1-10)
   ├── consecutive_fails (int)
   ├── total_attempts_for_card_level (int, confidence weight)
   ├── community_success_rate (float, global for this card/level)
   └── time_features (hour, dayofweek)
        ↓
   Train/Test Split
   (Temporal split — never shuffle by time to prevent data leakage)
        ↓
   Model Training
   ├── Baseline (majority class)
   ├── Logistic Regression
   ├── Random Forest
   └── XGBoost (primary)
        ↓
   Evaluation
   ├── Accuracy, Precision, Recall, F1
   ├── AUC-ROC
   └── Calibration curve (critical for probability estimates)
        ↓
   Model Registration
   (store to /models/ directory + DB ModelVersion record)
        ↓
   Prediction API
   POST /predict/upgrade
```

### Data Leakage Prevention

| Risk | Prevention |
|------|-----------|
| Temporal leakage | Always use time-based train/test split |
| Future success rates | Never use aggregate rates computed on test period |
| User-level leakage | User ID never used as a feature |
| Game-version leakage | Include `game_patch_version` as feature (Phase 2) |

### FastAPI Endpoints

```
POST  /predict/upgrade       # Predict upgrade outcome
POST  /predict/bait          # Bait probability for a sequence
POST  /train                 # Trigger model training (admin only)
GET   /models                # List model versions
GET   /models/{id}/metrics   # Model performance metrics
GET   /health                # Health check
```

---

## 6. Data Provider Architecture

### Interface Definitions

```csharp
// Core abstraction
public interface IPlayerDataProvider
{
    string Name { get; }
    ProviderPriority Priority { get; }
    
    Task<IEnumerable<PlayerDto>> GetPlayersAsync(CancellationToken ct);
    Task<PlayerDto?> GetPlayerBySpidAsync(int spid, CancellationToken ct);
    Task<bool> IsAvailableAsync(CancellationToken ct);
}

public interface ISeasonDataProvider
{
    Task<IEnumerable<SeasonDto>> GetSeasonsAsync(CancellationToken ct);
    Task<byte[]?> GetSeasonBadgeAsync(int nexonSeasonId, CancellationToken ct);
}

public interface IAttributeDataProvider
{
    Task<PlayerAttributesDto?> GetAttributesAsync(int spid, CancellationToken ct);
}
```

### Implementations

| Implementation | Interface | Source | Priority |
|----------------|-----------|--------|----------|
| `NexonApiPlayerProvider` | IPlayerDataProvider | Nexon Open API | 1 (Highest) |
| `StaticJsonFileProvider` | IPlayerDataProvider | Local JSON files | 2 |
| `ManualAdminProvider` | IAttributeDataProvider | Admin UI → DB | 1 |
| `NexonCdnImageProvider` | ISeasonDataProvider | Nexon CDN | 1 |
| `CachedPlayerProvider` | IPlayerDataProvider | Decorator wrapping #1 | - |

### Provider Chain (Composite Pattern)

```csharp
public class CompositePlayerDataProvider : IPlayerDataProvider
{
    private readonly IEnumerable<IPlayerDataProvider> _providers;
    
    public async Task<PlayerDto?> GetPlayerBySpidAsync(int spid, CancellationToken ct)
    {
        foreach (var provider in _providers.OrderBy(p => p.Priority))
        {
            if (!await provider.IsAvailableAsync(ct)) continue;
            
            var result = await provider.GetPlayerBySpidAsync(spid, ct);
            if (result != null) return result;
        }
        return null;
    }
}
```

---

## 7. Infrastructure

### Docker Compose

```yaml
services:
  web:          # Next.js (port 3000)
  api:          # .NET 10 API (port 5000)
  ml:           # Python FastAPI (port 8000)
  postgres:     # PostgreSQL 16 (port 5432)
  redis:        # Redis 7 (port 6379)
  pgadmin:      # DB management (dev only)
  hangfire:     # Job dashboard (dev only, port 5001)
```

### Environment Separation

| Environment | Config |
|-------------|--------|
| Development | docker-compose.dev.yml + .env.local |
| Staging | docker-compose.staging.yml + secrets manager |
| Production | docker-compose.prod.yml + cloud secrets |

---

## 8. Security Architecture

| Layer | Measure |
|-------|---------|
| Transport | HTTPS enforced, HSTS headers |
| Auth | JWT (15min) + Refresh Token (7 days, rotation) |
| API | Rate limiting per IP + per user |
| DB | Parameterized queries (EF Core), no raw SQL |
| Admin | Role-based authorization (User/Admin) |
| Secrets | Environment variables (never in code) |
| Data | Upgrade history anonymized in public stats |
| CORS | Strict origin whitelist |

---

## 9. Monitoring (Phase 2)

| Component | Tool |
|-----------|------|
| API metrics | Prometheus + Grafana |
| Error tracking | Sentry |
| Log aggregation | Loki |
| Uptime monitoring | Better Uptime |
| DB performance | pganalyze |
