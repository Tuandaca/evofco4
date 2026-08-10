# FIFAaddict Data Provider

The `FifaAddictDataProvider` is a core data acquisition module for FC Upgrade Intelligence. It connects to `https://en.fifaaddict.com` and retrieves comprehensive player and season data without requiring access to a public API.

## Extraction Mechanism
FIFAaddict does not provide an official API. The backend is a Nuxt.js Server-Side Rendered (SSR) application. The provider requests the HTML pages and extracts the initial `window.__NUXT__` JavaScript payload, which contains a deeply structured JSON object.

We use `Jint` (a .NET JavaScript engine) to safely execute the `window.__NUXT__` IIFE block in an isolated context and extract the raw data models, bypassing fragile HTML/CSS scraping entirely.

## Supported Fields
The Nuxt payload for a player detail page (`/fo4db/pid<uid>`) contains comprehensive stats:
- **Identity:** UID, Name, Short Name, Season Code, Team, Nation, League
- **General Attributes:** OVR, Positions, Height, Weight, Age, Foot Preference, Weak Foot, Skill Level
- **Detailed Attributes:** PAC, SHO, PAS, DRI, DEF, PHY, Price (PriceKr)
- **Extra:** Body Type, Work Rates, Traits

## Synchronization Strategy
The `ImportJobService` runs background tasks for sync operations:

### 1. `IMPORT_ALL`
Iterates through `fo4db?page=X` sequentially, extracting all players, mapping their attributes, and performing `Upsert` based on the unique `sourceId` for the `PlayerSeason`.

### 2. `SYNC` (Incremental)
Only discovers recent changes by iterating through the latest updated players and creating/updating records if their `DataHash` (SHA-256) indicates a modification.

## Resiliency and Rate Limiting
The `FifaAddictClient` is powered by `Polly` to guarantee resiliency against source failures:
- Standard HTTP Retry and Exponential Backoff.
- Automatic respect for HTTP 429 (`Retry-After`) with a fallback of 5-second delays if the server limits request frequency.
- Randomized User-Agent to conform to typical browser expectations.

## CLI Commands
The system can be triggered directly from the application's CLI args:
```bash
dotnet run -- data fifaaddict import
dotnet run -- data fifaaddict sync
dotnet run -- data fifaaddict import --dry-run
```

## Known Limitations
- If FIFAaddict completely rewrites their frontend to stop using Nuxt or hides the dehydration payload, the `FifaAddictParser` regex will fail.
- Detailed stats (like individual `Sprint Speed`) are not parsed fully yet; only the aggregated group stats (PAC, SHO...) are fully mapped to the `PlayerSeason` schema.

## Source Tracking
All records maintain `Source = "FIFAADDICT"`, `SourceId`, `SourceUrl`, and timestamps (`RetrievedAt`, `LastUpdatedAt`) to ensure full data lineage and traceability.
