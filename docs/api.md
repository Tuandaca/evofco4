# FC Upgrade Intelligence - API Documentation

## Third-Party Integrations

### FIFAaddict API (DEPRECATED)
* **Endpoint:** `https://en.fifaaddict.com/fo4db`
* **Type:** Internal Client API
* **Status:** INACCESSIBLE
* **Reason:** The actual data endpoints (e.g. `/api/fo4/players`) are strictly protected by Cloudflare and ReCaptcha. Unauthenticated bot requests return `400 Bad Request` ("What's wrong with you bro?") and headless browsers face connection resets. Pagination via URL parameters (`?page=X`) against the HTML endpoint returns static payloads, making bulk data acquisition impossible without breaking anti-bot rules.

### Potential Alternatives
* **Nexon Open API:** Recommended path for official static metadata (openapi.nexon.com).

## Core Application API (Backend)
(Documentation for internal API routes goes here)
