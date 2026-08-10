# Core API Documentation

> **Status**: Milestone 2 — VERIFIED ✅
> **Production Database**: PostgreSQL (Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4)
> **Local Dev Fallback**: SQLite (auto-detected via connection string heuristic)

## Overview

The Core API provides data access to the FC Online player database synchronized from FIFAaddict. It follows RESTful principles with `/api/v1/` versioning and standardized JSON responses.

**Base Path:** `/api/v1`

---

## Database Configuration

### Production (PostgreSQL)

Set the `DefaultConnection` connection string to a PostgreSQL URL:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=yourhost;Port=5432;Database=fcupgrade;Username=postgres;Password=yourpassword"
  }
}
```

### Local Development (SQLite Fallback)

If `DefaultConnection` is not set, the application auto-falls back to `local.db` (SQLite). 

> **Warning:** The following features require PostgreSQL and **will not work on SQLite**:
> - `GET /api/v1/players?search=...` — uses `EF.Functions.ILike` (PostgreSQL case-insensitive search)
> - `GET /api/v1/player-seasons?search=...` — same

---

## Standard Response Format

All successful API responses are wrapped in a standard `ApiResponse<T>` envelope:

```json
{
  "data": { ... }
}
```

For paginated endpoints, `data` is a `PaginatedResponse<T>`:

```json
{
  "data": {
    "items": [...],
    "page": 1,
    "pageSize": 24,
    "totalItems": 150,
    "totalPages": 7
  }
}
```

---

## Endpoints

### Players

#### `GET /api/v1/players`
Paginated list of all players.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `pageSize` | int | 24 | Items per page (max 100) |
| `search` | string | — | Filter by name (ILike, PostgreSQL only) |
| `sortBy` | string | `name` | `name` or `updatedAt` |
| `sortDirection` | string | `asc` | `asc` or `desc` |

**Response:** `PaginatedResponse<PlayerListItemDto>`

**Performance:** Pagination is database-side (`OFFSET/LIMIT`). Search uses a B-tree index on `Players.Name`.

---

#### `GET /api/v1/players/{id}`
Full player detail including all season variants.

**Path Parameters:**
- `id` (int): Internal database player ID

**Response:** `PlayerDetailDto` with embedded `Seasons` array

**SQL generated (PostgreSQL):**
```sql
SELECT p.*, ps.*, s.*
FROM Players p
LEFT JOIN PlayerSeasons ps ON p.Id = ps.PlayerId
INNER JOIN Seasons s ON ps.SeasonId = s.Id
WHERE p.Id = @id
ORDER BY p.Id, ps.Ovr DESC
```
A single LEFT JOIN — no N+1, column-selective `Select` projection.

**Returns:** `404 Not Found` with `ApiErrorResponse` if player not found.

---

### Player-Seasons

#### `GET /api/v1/player-seasons`
Paginated list of all player-season cards.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `pageSize` | int | 24 | Items per page |
| `search` | string | — | Filter by player name (PostgreSQL ILike) |
| `position` | string | — | Filter by position (e.g. `ST`, `CAM`) |
| `seasonId` | int | — | Filter by internal season ID |
| `seasonCode` | string | — | Filter by season code (e.g. `110`) |
| `teamId` | int | — | Filter by team |
| `nationId` | int | — | Filter by nation |
| `leagueId` | int | — | Filter by league |
| `minOvr` | int | — | Minimum OVR rating |
| `maxOvr` | int | — | Maximum OVR rating |
| `sortBy` | string | `ovr` | `ovr`, `name`, `price`, `height`, `age`, `updatedAt` |
| `sortDirection` | string | `desc` | `asc` or `desc` |

**Performance:** All filtering, sorting, and pagination are **server-side** (SQL `WHERE`, `ORDER BY`, `OFFSET/LIMIT`).

---

#### `GET /api/v1/players/{playerId}/player-seasons`
Player-seasons for a specific player (same filter parameters as above).

---

#### `GET /api/v1/player-seasons/{id}`
Full detail for a specific player-season card (all 6 stats, traits, price, etc.)

**Returns:** `PlayerSeasonDetailDto` | `404 Not Found`

---

### Seasons

#### `GET /api/v1/seasons`
Paginated list of all discovered seasons.

| Parameter | Type | Default |
|---|---|---|
| `page` | int | 1 |
| `pageSize` | int | 24 |

**Response:** `PaginatedResponse<SeasonListItemDto>` with `playerCount` per season.

---

#### `GET /api/v1/seasons/{id}`
Detail for a specific season.

---

#### `GET /api/v1/seasons/{id}/players`
All player-season cards belonging to a specific season.

---

### System

#### `GET /api/v1/system/health`
Health check.

#### `GET /api/v1/data-status`
Data import status and record counts.

#### `GET /api/v1/filters/positions`
Distinct positions for filter dropdowns.

#### `GET /api/v1/filters/teams`
Distinct teams for filter dropdowns.

#### `GET /api/v1/filters/nations`
Distinct nations for filter dropdowns.

#### `GET /api/v1/filters/leagues`
Distinct leagues for filter dropdowns.

---

## Error Handling

All errors return standard HTTP status codes. The global exception handler produces:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Player with ID 999 was not found."
  }
}
```

---

## Performance Characteristics

| Query | Pattern | N+1? | Notes |
|---|---|---|---|
| Player list | `SELECT` + `OFFSET/LIMIT` | No | Index on `Name` |
| Player detail | Single LEFT JOIN | No | LATERAL JOIN on PostgreSQL |
| Player-season list | `SELECT` + `OFFSET/LIMIT` | No | Composite index on `PlayerId,SeasonId` |
| Player-season detail | Single JOIN | No | Includes `Player` and `Season` |
| Season list | Aggregated `COUNT` subquery | No | |
| Filters | `DISTINCT` projection | No | |

---

## Integration Testing

Integration tests are in `tests/FCUpgrade.IntegrationTests/`.

To run against a real PostgreSQL instance, set:
```
$env:INTEGRATION_DB_CONNECTIONSTRING = "Host=localhost;Database=fcupgrade_test;Username=postgres;Password=yourpassword"
dotnet test tests/FCUpgrade.IntegrationTests/
```

Tests skip gracefully with a clear message if the env var is not set.
