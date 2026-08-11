# Data Source Documentation

## Current Source: FIFAaddict (Status: NOT SUITABLE)

### Investigation Findings
* **Data Mechanism:** The site uses Nuxt.js Server-Side Rendering (SSR). Initial data is embedded in `window.__NUXT__`. 
* **Pagination Mechanism:** The SSR payload is static. Passing `?page=X` in standard HTTP requests returns exactly the same 35 default players (e.g., Maradona, Pelé) for every page.
* **Player Endpoint:** The site relies on internal endpoints like `/api/fo4/players` or `/api/fo4db` for dynamic searching and true pagination.
* **Season Mechanism:** The `year` field maps to a numeric Season ID (e.g., 110), while `year_short` maps to the actual Season Code (e.g., 'ICONTMB'). The current parser maps this incorrectly because `season_name` is empty.
* **Access Restrictions:** These endpoints enforce strict anti-bot measures, including Cloudflare protection and ReCaptcha. Automated requests return `400 Bad Request` with the message `"What's wrong with you bro?"` or trigger a connection reset/timeout when using headless browsers.

### Decision
Because the complete dataset cannot be acquired reliably without bypassing access controls and CAPTCHAs, FIFAaddict is **NOT SUITABLE** as a reliable automated source.

## Alternative Sources

### 1. NEXON Open API (Official FC Online API)
* **Coverage:** Complete game metadata, match history, and rankers for the Korean region.
* **Access Method:** Official Developer Portal (openapi.nexon.com) with API Key.
* **Reliability:** High. This is the official developer pipeline.
* **Limitations:** Primarily targeted at Korean region data. Requires registration and adherence to Nexon's terms of service. 

### 2. Garena VN / TH Data Center
* **Coverage:** Official player database for Vietnam and Thailand regions.
* **Access Method:** Publicly visible on `fconline.garena.vn`, but network requests to the site or its API are heavily protected by Cloudflare (returns `403 Forbidden` for standard bots).
* **Limitations:** Would require web scraping through Cloudflare, which violates the "no bypass" rule.

### 3. Community Sites (FO4Player)
* **Coverage:** Unclear.
* **Access Method:** Web scraping.
* **Limitations:** The site connection timed out during evaluation. Reliability is low.

## Recommended Strategy
The recommended path forward is to register for the **NEXON Open API** to pull static metadata (Player IDs, Season Codes, and Base OVRs) officially, supplemented by manual static CSV dumps if Nexon's API lacks certain attributes. The current FIFAaddict provider should be marked for deprecation.
