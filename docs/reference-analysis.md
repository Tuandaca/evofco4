# Reference Site Analysis — fo4s.net/nang-cap-the-fo4

> **URL**: https://www.fo4s.net/nang-cap-the-fo4  
> **Purpose**: Functional requirements and information architecture analysis only.  
> **IMPORTANT**: This analysis is for understanding user expectations. No UI, code, or branding from this site will be copied.

---

## 1. Page Purpose

The page "Nâng cấp thẻ" (Card Upgrade) is an FC Online analytics tool that:
- Displays the current upgrade level of a player card
- Shows the player's stats/attributes at a given level
- Allows users to simulate card upgrades (levels 1-10)
- Aggregates community upgrade attempt data
- Shows top-ranked players being upgraded

---

## 2. URL Structure

```
Base URL:     https://www.fo4s.net/nang-cap-the-fo4
Player page:  https://www.fo4s.net/player-{name}-{season-code}-{player-id}

Examples:
  /player-marvin-ducksch-25dp-90649
  /player-zlatan-ibrahimovic-spt-94602
  /player-toni-kroos-ip-94575
  /player-isco-spt-94617
  /player-hakan-calhanoglu-spt-94618
  /player-david-beckham-spt-94634
  /player-wayne-rooney-spt-94645
  /player-samuel-etoo-spt-94603
  /player-vinicius-junior-spt-94633
  /player-iago-aspas-spt-94607
  /player-didier-drogba-spt-94614
  /player-bruno-fernandes-spt-94620
```

### URL Pattern Analysis

```
/player-{player-name-slug}-{season-code}-{numeric-id}

season-code examples:
  25dp  = Season 25 Draft Pick (2025)
  spt   = Special (SPT category)
  ip    = Icon Player
  cb    = Club Bonus or similar

numeric-id: Player ID from Nexon database
```

---

## 3. Data Observed in HTML Source

### 3.1 Player Card Display

Each player card in the list shows:
- **Player image**: `https://fo4s.net/storage/player/{bucket}/{id}.png`
- **Position badge**: e.g., `ST`, `CB`, `CAM`, `CM`, `RW`, `RM`, `CF`
- **OVR (Overall Rating)**: e.g., 113, 120, 121, 122, 131
- **OVR Class**: `over110`, `over120`, `over130` CSS classes indicate rating bracket
- **Season/Class badge**: `https://fo4s.net/storage/property/class/class{classId}.png`
- **Player name** (abbreviated)
- **Upgrade level dropdown**: 1-10

### 3.2 Upgrade Level Selector

```html
<div class="lv-up" data-id="90649" data-lv="1">
  <button class="fo-level lv-1">1</button>
  <ul class="dropdown-menu">
    <li><a class="fo-level lv-1">1</a></li>
    ...
    <li><a class="fo-level lv-10">10</a></li>
  </ul>
</div>
```

- Levels range from **1 to 10**
- Each level is selectable via dropdown
- `data-id` = player card numeric ID
- `data-lv` = current selected level

### 3.3 Property Data (JavaScript `_initial` object)

The page embeds complete league/club/nation data in a JavaScript object:

```javascript
var _initial = {
  "properties": {
    "league": [
      {
        "id": 1,
        "name": "Denmark 3F Superliga",
        "slug": "denmark-3f-superliga",
        "status": 1,
        "type": "league",
        "childs": [
          {
            "id": 39,
            "name": "FC Copenhagen",
            "slug": "fc-copenhagen",
            "thumb": "https://fo4s.net/storage/property/club/club39.png",
            "type": "club",
            "order": 93
          }
        ]
      }
    ]
  }
}
```

Leagues confirmed (IDs 1-50+ visible):
- Denmark 3F Superliga (id: 1)
- Belgian Jupiler Pro League (id: 2)
- Dutch Eredivisie (id: 3)
- English Premier League (id: 4)
- England EFL Championship (id: 5)
- French Ligue 1 Uber Eats (id: 6)
- French League 2 BKT (id: 7)
- German Bundesliga (id: 8)
- German Bundesliga 2 (id: 9)
- ... (50+ leagues total)

---

## 4. Key Functional Features

### 4.1 Player Search/Selection

- Text search for player name
- Filter by: League → Club → Player
- Filter by: Nation
- Filter by: Season/Class type
- Filter by: Position
- Filter by: OVR range

### 4.2 Upgrade Level Simulation

- Select a player card
- Choose upgrade level (1-10)
- System shows attributes at that level
- Calculates attribute deltas per level
- Shows success rates for each upgrade attempt

### 4.3 Top Players Sidebar

Two tabs visible:
- **"Hôm nay" (Today)**: Most viewed/upgraded today
- **"Tháng này" (This month)**: Most viewed/upgraded this month

Players shown with:
- Card image
- Position
- OVR
- Season badge
- Name

### 4.4 Navigation Structure

```
Main Navigation:
  - Trang chủ (Home)
  - Cầu thủ (Players)     → /players or similar
  - Đội hình (Formation)  → squad builder
  - Thị trường (Market)   → price data
  - Nâng cấp (Upgrade)    → current page
  - Thống kê (Statistics) → upgrade stats
  - Đăng nhập (Login)     → /login
  - Đăng ký (Register)    → /register
```

---

## 5. Information Hierarchy

```
Page: Nâng cấp thẻ
├── Header (Player selector)
│   ├── Search box (player name)
│   ├── Filter: League/Club
│   ├── Filter: Nation
│   ├── Filter: Season/Class
│   └── Filter: Position / OVR
│
├── Main Content Area
│   ├── Selected Player Card
│   │   ├── Card image (full)
│   │   ├── Upgrade level selector (1-10)
│   │   ├── Attributes at current level
│   │   │   ├── PAC (Pace)
│   │   │   ├── SHO (Shooting)
│   │   │   ├── PAS (Passing)
│   │   │   ├── DRI (Dribbling)
│   │   │   ├── DEF (Defense)
│   │   │   └── PHY (Physical)
│   │   └── Upgrade statistics
│   │       ├── Total attempts recorded
│   │       ├── Success rate (%)
│   │       └── Community data chart
│   │
│   └── Upgrade History Table
│       ├── Date/Time
│       ├── Level attempted
│       ├── Result (Success/Fail)
│       └── Username (optional)
│
└── Sidebar
    ├── Top players today
    └── Top players this month
```

---

## 6. Season Code System

From URL slugs observed:

| Code | Meaning |
|------|---------|
| `25dp` | 2025 Draft Pick |
| `spt` | Special |
| `ip` | Icon Player |
| `cb` | Club Bonus |
| `25lr` | 2025 League Record (likely) |

The season code is part of the player slug and determines the card type.

---

## 7. Class/Season Image Pattern

```
Season badge: https://fo4s.net/storage/property/class/class{classId}.png

Confirmed IDs observed:
- class2015.png (likely a 2025 season badge)
- class2121.png (SPT class badge)
- class2113.jpg (another class)
```

This correlates with Nexon's season ID system.

---

## 8. Authentication System

The site requires login for:
- Submitting upgrade attempts
- Saving favorites
- Accessing personal history

Login methods:
- Email/password
- Facebook OAuth

Login endpoint: `POST /login` with CSRF token

---

## 9. Technical Stack Observed

- **Frontend**: HTML + Bootstrap 5 + jQuery + Vue.js component (`<fo-tool/>`)
- **Backend**: PHP/Laravel (Laravel CSRF `_token` pattern visible)
- **Analytics**: Google Analytics (G-58C26BMH3G)
- **Social**: Facebook SDK (appId: 368604785276141)
- **CDN**: Cloudflare (beacon.min.js detected)
- **Icons**: FontAwesome 5.8.2, Material Design Icons

---

## 10. robots.txt

```
User-agent: *
Disallow: /?
```

Only URL query strings (`?param=value`) are disallowed. Static pages are accessible.

---

## 11. Key Insights for Our System

| Feature | fo4s.net Behavior | Our Implementation Approach |
|---------|-------------------|----------------------------|
| Upgrade levels | 1-10 dropdown | Same: enum/int 1-10 |
| Player ID | Numeric (e.g., 90649) | Map to Nexon spid |
| OVR brackets | over110, over120, over130 | Store as integer, color-code dynamically |
| Season in URL | Slug code (25dp, spt) | Separate Season entity with code + slug |
| Data embedding | JS `_initial` object | API response (JSON, not embedded) |
| Community data | Aggregated upgrade history | User-submitted UpgradeAttempt records |
| Top players | Today/Month tabs | Dashboard widget with Redis-cached rankings |

---

## 12. Features NOT to Copy

As instructed, these elements will NOT be reproduced:
- fo4s.net branding, colors, logo
- Bootstrap-based layout
- jQuery-based interactivity
- Laravel/PHP backend structure
- URL slug format (we use numeric IDs + clean slugs)

---

## 13. Summary of Functional Requirements Derived

1. Users can **search and select any FC Online player card** by name, season, position, league, nation
2. Users can **select upgrade level** (1-10) for a selected card
3. System displays **attributes at each upgrade level**
4. System shows **aggregate upgrade statistics** (success rate by level from community data)
5. Users can **log their own upgrade attempts** (authenticated)
6. System shows **trending players** (most upgraded today/this month)
7. System provides **bait sequence detection** (unusual upgrade patterns suggesting "bait" mechanics)
8. All data is **browsable without login**; logging requires account
