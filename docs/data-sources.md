# Data Sources — FC Upgrade Intelligence

> **Date**: 2026-08-10  
> **Note**: All data access must comply with the terms of service of each source.

---

## 1. Nexon Open API (Korea) — PRIMARY SOURCE

| Field              | Details                                           |
| ------------------ | ------------------------------------------------- |
| **Source**         | Nexon Corporation (Korea)                         |
| **URL**            | https://open.api.nexon.com                        |
| **Type**           | Official Public API (requires registration)       |
| **Authentication** | API Key in header: `x-nxopen-api-key: [your_key]` |
| **Registration**   | Free account at open.api.nexon.com                |

### Available Endpoints

```
GET /fconline/v1/metadata/spid          # Player IDs (spid) + names
GET /fconline/v1/metadata/seasonid      # Season IDs + names + images
GET /fconline/v1/metadata/spposition    # Position codes
GET /fconline/v1/metadata/division      # Division/rank data
GET /fconline/v1/user/basic            # User profile (requires ouid)
GET /fconline/v1/user/maxdivision      # User max rank
GET /fconline/v1/user/match            # Match history list
GET /fconline/v1/match                 # Match details by matchid
GET /fconline/v1/ranking               # Player rankings
```

### Image Assets

```
Player Card Image:  https://fco.dn.nexoncdn.co.kr/live/externalAssets/common/players/p{spid}.png
Player Action:      https://fco.dn.nexoncdn.co.kr/live/externalAssets/common/playersAction/p{spid}.png
Season Badge:       https://fco.dn.nexoncdn.co.kr/live/externalAssets/common/season/s{seasonId}.png
```

### Data Available

- **Player IDs (spid)**: Composite ID = seasonId (3-4 digits) + playerId (6 digits)
- **Season IDs**: Season code + name (e.g., "22DP" = 2022 Draft Pick)
- **Positions**: Position codes (e.g., 0=GK, 1=CB, 2=LB...)
- **Match Records**: Per-player stats per match
- **Rankings**: Top players by various metrics

### Limitations

- No direct attribute data (speed, shooting, etc.) from the API
- Data delay: ~2 hours after real-time
- Must refresh stored data every 30 days per ToS
- Korean server only — not applicable to Vietnam (Garena) server directly
- Rate limits apply per API key

### Reliability

**High** — Official source, stable, documented

### Legal/Licensing

- Terms of Service: https://open.api.nexon.com/common/termsofuse
- **Permitted**: Non-commercial use, personal/hobby projects
- **Required**: Attribution to Nexon, refresh data every 30 days
- **Prohibited**: Commercial redistribution without agreement

### Fallback

If Nexon API is unavailable: Use cached database copy (up to 30 days old acceptable per ToS)

---

## 2. FC Online Vietnam (Garena) — REFERENCE ONLY

| Field              | Details                            |
| ------------------ | ---------------------------------- |
| **Source**         | Garena Vietnam                     |
| **URL**            | https://fconline.garena.vn         |
| **Type**           | Official game portal               |
| **Authentication** | Required for personal account data |

### Available (via official website — manual exploration)

- In-game Data Center
- Player lookup tools
- Market price information
- Upgrade rate information (displayed in-game)

### Limitations

- No public API for developers
- Account required for personalized data
- Terms of Service prohibit automated scraping

### Legal/Licensing

**CAUTION**: Automated scraping of the Garena Vietnam website violates their Terms of Service. Do NOT implement automated crawling of this site.

---

## 3. fo4s.net Community Database — REFERENCE ONLY

| Field              | Details                             |
| ------------------ | ----------------------------------- |
| **Source**         | Community-operated (Vietnam)        |
| **URL**            | https://www.fo4s.net                |
| **Type**           | Community database / fan site       |
| **Authentication** | User registration for full features |

### Data Observed (from HTML analysis)

The site uses a Vue.js frontend (`<fo-tool/>` component) with data embedded in JavaScript:

```javascript
var _initial = {
  "properties": {
    "league": [{ "id": 1, "name": "Denmark 3F Superliga", "childs": [...clubs] }],
    "nation": [...],
    "class": [...]  // Season/card class data
  }
}
```

**Confirmed data structures found**:

- League hierarchy with club IDs and image URLs
- Player cards with numeric IDs (e.g., `90649` = Marvin Ducksch)
- Season/class images: `https://fo4s.net/storage/property/class/class{id}.png`
- Player images: `https://fo4s.net/storage/player/{bucket}/{id}.png`
- Club images: `https://fo4s.net/storage/property/club/club{id}.png`
- Upgrade levels: 1-10 selectable per player card
- Player rating points displayed with "over110", "over120", "over130" CSS classes

**URL pattern observed**:

```
/player-{name}-{season-code}-{id}
Example: /player-marvin-ducksch-25dp-90649
```

**Robots.txt**:

```
User-agent: *
Disallow: /?
```

Only query strings are disallowed. Main paths are not blocked by robots.txt.

### Limitations

- No documented public API
- The API endpoint `/api/card/nang-cap?id={id}&lv={level}` returns full HTML page, not JSON
- Reliability depends on site owner
- No SLA or update guarantees

### Legal/Licensing

**CAUTION**: No explicit terms of service or data licensing found. Contact site owner before any automated data collection. Use for functional requirements analysis ONLY.

---

## 4. Kaggle / Public Datasets — SUPPLEMENTARY

| Field              | Details                |
| ------------------ | ---------------------- |
| **Source**         | Kaggle.com             |
| **URL**            | https://www.kaggle.com |
| **Type**           | Public datasets        |
| **Authentication** | Kaggle account (free)  |

### Relevant Datasets

Search for:

- `FC Online player stats`
- `FIFA player attributes` (EA FC / FIFA series share attribute structure)
- `FUT player database`

These can provide:

- Historical attribute distributions
- Player OVR ranges per season type
- Upgrade probability datasets (community-collected)

### Limitations

- May be outdated
- Not specific to Vietnam server
- Data quality varies

### Legal/Licensing

Varies per dataset. Check individual licenses (CC0, CC BY, etc.)

---

## 5. Static JSON / File Provider — FALLBACK

| Field        | Details                             |
| ------------ | ----------------------------------- |
| **Source**   | Internal                            |
| **Type**     | Static JSON files curated by admins |
| **Location** | `/data/*.json` in repository        |

### Purpose

- Seed data for initial deployment
- Fallback when APIs are unavailable
- Admin-curated corrections and overrides

### Data Format Example

```json
{
  "players": [
    {
      "spid": 2200090649,
      "name": "Marvin Ducksch",
      "seasonId": 2200,
      "playerId": 90649,
      "position": "ST",
      "ovr": 113
    }
  ]
}
```

---

## 6. Data Source Priority Matrix

| Priority | Source             | Data Type                          | Method        |
| -------- | ------------------ | ---------------------------------- | ------------- |
| 1        | Nexon Open API     | Player IDs, Season IDs, Match Data | REST API      |
| 2        | Static JSON Files  | Attribute data, Upgrade rates      | File read     |
| 3        | Kaggle Datasets    | Historical attributes              | Manual import |
| 4        | Admin Manual Entry | Corrections, special cards         | Admin UI      |

---

## 7. Critical Data Gaps

The following data is **NOT available from any official API** and must be sourced differently:

| Data                                  | Gap                        | Resolution Strategy                                  |
| ------------------------------------- | -------------------------- | ---------------------------------------------------- |
| Player attributes (speed, shot, etc.) | No official API            | Admin data entry + community dataset                 |
| Upgrade success rates                 | No official API            | Collect from user upgrade history + game patch notes |
| Bait card sequences                   | Game mechanic, not exposed | User-submitted data + statistical modeling           |
| Market prices                         | No official API            | Admin-curated periodic updates                       |
| Skill moves / traits                  | No official API            | Admin data entry                                     |

---

## 8. Recommended Data Strategy

```
Phase 1 (MVP):
  - Nexon Open API → player/season IDs + images
  - Static JSON → attribute data (manually curated)
  - User submissions → upgrade attempt logs

Phase 2 (Growth):
  - Automated import jobs from Nexon API (scheduled)
  - ML model trained on user-submitted upgrade data

Phase 3 (Mature):
  - Community data validation workflow
  - Multiple data source reconciliation
  - Crowdsourced attribute corrections
```

---

## 9. Legal Summary

| Source         | Scraping Allowed?   | API Available? | ToS Risk |
| -------------- | ------------------- | -------------- | -------- |
| Nexon Open API | N/A (official)      | Yes (free key) | Low      |
| Garena VN      | NO                  | No             | HIGH     |
| fo4s.net       | Robots.txt: limited | No public API  | Medium   |
| Kaggle         | Depends on dataset  | Yes            | Low      |
| Internal JSON  | N/A                 | N/A            | None     |

> **Policy**: This project will ONLY use the Nexon Open API as an automated external data source. All other data will be manually curated by administrators or user-submitted. No scraping of Garena or third-party sites.
