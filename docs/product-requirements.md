# Product Requirements Document — FC Upgrade Intelligence

> **Version**: 1.0  
> **Date**: 2026-08-10  
> **Status**: Draft

---

## 1. Target Users

### 1.1 Primary Users

| Persona | Description | Goals |
|---------|-------------|-------|
| **Casual Player** | FC Online Vietnam players who upgrade cards occasionally | Know success rates before spending resources |
| **Competitive Player** | Players who upgrade many cards to build strong teams | Optimize upgrade strategy, detect bait sequences |
| **Trader/Investor** | Players who buy/sell cards on the market | Track card value changes post-upgrade |

### 1.2 Secondary Users

| Persona | Description | Goals |
|---------|-------------|-------|
| **Community Analyst** | FC Online content creators, streamers | Access statistics for content |
| **Admin** | Platform administrators | Manage data, import player info, monitor system |

---

## 2. Core Use Cases

### UC-01: Search and Browse Player Cards
- User searches for a player by name, position, season, league, or nation
- System displays matching player cards with OVR and season info
- User can view detailed card information

### UC-02: View Player Attributes at Upgrade Level
- User selects a player card
- User selects upgrade level (1-10)
- System displays all attributes at that level
- System shows attribute deltas compared to previous level

### UC-03: View Upgrade Statistics
- User views historical upgrade data for a specific card + level combination
- System shows: total attempts, success rate, fail rate
- System shows community-contributed data with confidence intervals
- System shows upgrade success rate trend over time

### UC-04: Log Upgrade Attempt
- Authenticated user logs a new upgrade attempt
- User inputs: player card, level attempted, result (success/fail), bait count
- System validates and stores the record
- System updates aggregate statistics in real-time

### UC-05: Bait Sequence Analysis
- User inputs a sequence of recent upgrade results
- System analyzes the pattern against known bait mechanics
- System determines: "safe to upgrade", "possible bait", "high bait probability"
- System recommends action

### UC-06: ML-based Upgrade Prediction
- User requests a prediction for a specific card + level
- ML model returns predicted success probability with confidence
- System shows model-based recommendation vs. community data comparison

### UC-07: Historical Upgrade Statistics
- User browses aggregate statistics filtered by: season, position, OVR range, time period
- System provides charts: success rate trends, most upgraded cards, upgrade cost analysis

### UC-08: Manage Favorites
- Authenticated user saves player cards to favorites
- User can view saved favorites with current stats

### UC-09: Admin Data Management
- Admin imports player data from Nexon API
- Admin adds/edits player attributes manually
- Admin approves or rejects community-submitted corrections
- Admin manages seasons, leagues, nations

---

## 3. Primary User Flows

### Flow 1: Quick Upgrade Check

```
Home Page
  → Search player name
  → Select player card from results
  → Select upgrade level
  → View stats + success rate
  → Decide to upgrade or not
```

### Flow 2: Bait Detection

```
Bait Analysis Page
  → Input recent upgrade sequence (e.g., fail-fail-fail-success-fail-fail)
  → System analyzes pattern
  → View bait probability score
  → View recommendation
  → Optionally log attempts
```

### Flow 3: Deep Research

```
Statistics Page
  → Filter by season type (e.g., "SPT cards")
  → Filter by position (e.g., "ST")
  → Filter by OVR range (e.g., 110-120)
  → View success rate charts per level
  → Identify optimal upgrade levels
```

### Flow 4: Admin Import

```
Admin Panel → Data Management
  → Trigger Nexon API import
  → Review import results
  → Manually add/correct missing attributes
  → Publish data
```

---

## 4. MVP (Milestone 1-2)

### Included in MVP

- [ ] Player database (from Nexon API + static JSON)
- [ ] Season database
- [ ] Player card detail page (attributes at each level)
- [ ] Upgrade statistics display (community aggregated)
- [ ] User registration / login
- [ ] Log upgrade attempts
- [ ] Basic player search and filter
- [ ] Admin panel: import from Nexon API, manage data

### Excluded from MVP

- Bait sequence analysis
- ML predictions
- Market prices
- Advanced statistics charts
- Favorites sync across devices
- Recommendation engine

---

## 5. Future Features (Post-MVP)

| Feature | Priority | Complexity |
|---------|----------|------------|
| ML upgrade prediction | High | High |
| Bait sequence analyzer | High | Medium |
| Market price tracking | Medium | High |
| Team builder integration | Medium | High |
| Push notifications (upgrade alerts) | Low | Medium |
| Mobile app | Low | Very High |
| Export data to CSV/Excel | Low | Low |
| Compare multiple cards side-by-side | Medium | Medium |

---

## 6. Data Requirements

### 6.1 Player Data

| Field | Type | Source |
|-------|------|--------|
| Player ID (Nexon spid) | int | Nexon API |
| Player name | string | Nexon API |
| Season ID | int | Nexon API |
| Season name | string | Nexon API |
| Position(s) | string[] | Admin |
| OVR (Overall Rating) | int | Admin/community |
| Attributes (PAC, SHO, PAS, DRI, DEF, PHY) | int per level | Admin |
| Sub-attributes (Sprint Speed, Finishing, etc.) | int per level | Admin |
| Skill moves | int (1-5) | Admin |
| Weak foot | int (1-5) | Admin |
| Work rates | enum | Admin |
| Traits | string[] | Admin |
| Player image URL | string | Nexon CDN |
| Season badge URL | string | Nexon CDN |

### 6.2 Upgrade Data

| Field | Type | Source |
|-------|------|--------|
| Player card ID | FK | System |
| Upgrade level (from) | int 1-9 | User |
| Result (success/fail) | bool | User |
| Timestamp | datetime | System |
| User ID | FK (optional) | System |
| Bait count before success | int | User (optional) |

### 6.3 Statistical Aggregates

| Field | Type | Computation |
|-------|------|-------------|
| Total attempts by level | int | Aggregate |
| Success count by level | int | Aggregate |
| Success rate by level | float | Computed |
| Confidence interval | float | Statistical |
| 7-day trend | float[] | Time series |
| 30-day trend | float[] | Time series |

---

## 7. ML Requirements

### 7.1 Problem Statement

**Binary classification**: Given a player card + upgrade level + recent upgrade history, predict whether the next upgrade attempt will succeed.

### 7.2 Features

- Player OVR bracket
- Season type (normal, SPT, IP, etc.)
- Upgrade level (1-10)
- Historical success rate for this card/level
- Number of consecutive failures (bait depth)
- Time of day / day of week
- Total community attempts count (data confidence)

### 7.3 Labels

- `1` = success
- `0` = fail

### 7.4 Models

| Model | Purpose |
|-------|---------|
| Baseline (majority class) | Benchmark |
| Logistic Regression | Interpretable baseline |
| Random Forest | Feature importance |
| XGBoost | Primary production model |

### 7.5 Minimum Data Requirement

- MVP: At least 10,000 labeled upgrade attempts
- Production model: 100,000+ attempts across diverse cards
- Per-card model: Feasible with 500+ attempts per card

### 7.6 Constraints

- Do NOT use LLM as primary prediction engine
- Models must be explainable (SHAP values)
- Predictions must include confidence intervals
- Models retrained weekly with new data

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Page load < 2s (P95), API response < 200ms |
| **Availability** | 99.5% uptime (3.6 hours downtime/month max) |
| **Scalability** | Support 10,000 concurrent users |
| **Security** | HTTPS, JWT auth, rate limiting, SQL injection prevention |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Mobile** | Fully responsive (mobile-first design) |
| **SEO** | Server-side rendering for all public pages |
| **Privacy** | User data is private; upgrade history is anonymized in public stats |

---

## 9. Constraints

| Constraint | Details |
|------------|---------|
| **Data** | No scraping Garena VN; must use Nexon Open API |
| **Legal** | Must comply with Nexon API ToS |
| **Budget** | Optimized for self-hosted or low-cost cloud |
| **Tech Stack** | Next.js + .NET 10 + PostgreSQL + Redis + Python as specified |

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Monthly active users | 1,000+ within 3 months |
| Upgrade attempts logged | 10,000+ within 3 months |
| ML prediction accuracy | > 60% precision on test set |
| User satisfaction | > 4/5 stars on UX survey |
| Page load speed | < 2 seconds (P95) |
