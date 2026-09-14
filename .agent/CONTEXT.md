# 📋 PROJECT CONTEXT - evofco4

> **QUAN TRỌNG**: File này giúp AI nhớ context dự án giữa các sessions.
> Hãy update thường xuyên để AI hiểu được tiến độ và những gì đã làm.

---

## 📊 Project Status

| Field | Value |
|-------|-------|
| **Phase** | Milestone 6 — Bait Analysis ✅ COMPLETE |
| **Project Name** | FC Upgrade Intelligence |
| **Started** | 2026-08-10 |
| **Last Updated** | 2026-09-03 |
| **Project Types** | 🤖 AI/ML Project, 🔥 Full-Stack Web App |

### Phases:
- ✅ Architecture & Research (DONE)
- ✅ Milestone 1 — Data Foundation (DONE)
- ✅ Milestone 1.5 — FIFAaddict Data Acquisition Recovery (DONE)
- ✅ Milestone 2 — Core API (DONE)
- ⏳ Milestone 3 — Frontend Core (IN PROGRESS)
  - ✅ Milestone 3A — Next.js Frontend Foundation
  - ✅ Milestone 3B — Player Database
  - ⏳ Milestone 3C — Player Details (NEXT)
- ✅ Milestone 6 — Bait Analysis (DONE)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16 (Turbopack) + TypeScript + TailwindCSS v4 + shadcn/ui |
| **Backend** | .NET 10 Web API (C#) + EF Core 10 |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **ML Service** | Python 3.11 + FastAPI + XGBoost (Pending) |
| **Jobs** | Hangfire |
| **Infrastructure** | Docker Compose |

---

## 🎯 Current Focus

> Đã hoàn thành chuyển đổi thuật toán Phân Tích Dây Mồi (Bait Analysis Engine) từ Render Backend sang thuần Client-side (TypeScript) trong Next.js Frontend (`frontend/src/lib/bait/baitEngine.ts`).
> Loại bỏ độ trễ phản hồi mạng (0ms latency), cho phép người dùng tính toán và nhận kết quả gợi ý đập thẻ ngay lập tức khi thay đổi tham số.

**Project**: FC Upgrade Intelligence — FC Online analytics platform

**Next action**: Tiếp tục phát triển các tính năng khác hoặc tích hợp Nexon Open API cho Player DB.

---

## ✅ Completed Features

### Architecture Phase (2026-08-10)
- [x] `docs/project-audit.md` — Repository audit
- [x] `docs/data-sources.md` — Data source research (Nexon API, legal analysis)
- [x] `docs/reference-analysis.md` — fo4s.net functional analysis
- [x] `docs/product-requirements.md` — PRD with ML requirements
- [x] `docs/architecture.md` — System + provider architecture
- [x] `docs/database.md` — ERD + 21 entity schema
- [x] `docs/api.md` — REST API spec (~50 endpoints)
- [x] `docs/roadmap.md` — 8-milestone implementation roadmap
- [x] `docs/project-plan.md` — Master project plan

### Implementation Phase (Current)
- [x] **Data Foundation (FIFAaddict)**:
  - Scraped FIFAaddict via Nuxt JSON state extraction
  - Created `.NET` EF Core models (`Player`, `Season`, `PlayerSeason`, `ImportJob`)
  - Implemented `FifaAddictClient` with Polly retry policies
  - Implemented data hashing (`FifaAddictDataHash`) for change detection
  - Created Admin API endpoint & CLI support for triggering jobs
  - **Milestone 1.5 Audit:** Investigated FIFAaddict pagination and determined it is **NOT SUITABLE** due to Cloudflare/ReCaptcha blocking dynamic pagination. Recommended migrating to Nexon Open API.

- [x] **Milestone 2: Core API**
  - PostgreSQL is the production provider (`Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4`)
  - Restored production-quality `Select` projection for `GetPlayerByIdAsync` (single LEFT JOIN, no N+1)
  - Removed unnecessary `Include` in-memory workaround
  - Confirmed `EF.Functions.ILike` for case-insensitive search (PostgreSQL-only, by design)
  - All pagination, filtering, sorting verified as database-side
  - Integration test infrastructure created (`PostgresIntegrationFixture`, 14 tests, graceful skip when no PG)

- [x] **Milestone 3A & 3B: Frontend Foundation & DB**
  - Tailwind v4, API client, Shadcn-style components configured
  - URL-driven state for search, filter, sort, pagination
  - Responsive layout (Grid/Compact toggles, Mobile filters)

- [x] **Milestone 6: Bait Analysis (Fullstack)**
  - **Backend**: Implemented `BaitAnalysisService.cs` with AI blending logic (min 10 samples threshold).
  - **Algorithm**: Hardcoded FCO4 baseline probabilities mapped with dynamic Bait Score modifiers. Includes Rhythm Tips (e.g., "Nhịp 5-6").
  - **Frontend UI**: Built `/bait` route with a modern 3-column layout.
  - **UX Polish**: Added animated number transitions (`useAnimatedNumber`), custom Target Bars slider with exact ticks, and "Mồi Nổ" auto-submit feedback loop.
  - **Storage**: Integrated LocalStorage for Recent Sessions (Lịch Sử Các Dây Mồi) on the right sidebar.
  - **Production Hotfixes**: Fixed React 'use-before-declaration' crash, optimized slider debounce to prevent API spam/aborts, fixed slider thumb CSS styling, and ensured proxy connectivity to the Render backend.
  - **Client-side Engine Migration**: Migrated entire Bait Analysis algorithm to `frontend/src/lib/bait/baitEngine.ts` for zero-latency local calculations, removing reliance on backend API calls.

### Implementation (Pending)
- [ ] Milestone 0: Infrastructure (Docker + CI)
- [ ] Milestone 3C: Player Details
- [ ] Milestone 4: Auth + Upgrade Logging
- [ ] Milestone 5: ML Baseline
- [ ] Milestone 7: Admin Panel
- [ ] Milestone 8: Statistics + Launch

---

## 📝 Important Decisions

| Decision | Reason | Date |
|----------|--------|------|
| Backend = .NET 10 | Production-grade, EF Core, Hangfire | 2026-08-10 |
| ML = XGBoost | Interpretable, fast, purpose-built | 2026-08-10 |
| FIFAaddict Source Deprecation | Pagination blocked by ReCaptcha; move to Nexon Open API | 2026-08-11 |
| Blending AI logic on Bait | Hardcoded 10 samples threshold ensures the prediction isn't skewed by low data size. | 2026-09-02 |
| Layout 3 Cột cho Bait | Cải thiện UX, tận dụng max-width tốt hơn, hiển thị lịch sử không đè/kéo giãn giao diện chính. | 2026-09-02 |

---

## 🐛 Known Issues

Các lỗi/issues đang tồn tại:

- The current database has exactly 35 records because FIFAaddict scraper hit an anti-bot dead end. A data source migration (e.g., Nexon Open API) is required to acquire the full dataset.

---

## 📌 Next Steps

1. **[BLOCKING]** Quyết định nguồn dữ liệu thay thế FIFAaddict (ưu tiên: Nexon Open API)
2. Sau khi có nguồn dữ liệu hợp lệ → chạy import đầy đủ
3. Tiến hành Milestone 3C: Trang chi tiết cầu thủ (Player Details)
4. Tích hợp database thật để lưu trữ dữ liệu (feedback_bait) cho tính năng phân tích Mồi (thay vì in-memory như hiện tại).

---

## 💬 Notes

Ghi chú thêm:

- Project được tạo bởi VibeCoding Project Creator
- Xem GEMINI.md để biết tech stack và AI configuration
- Update file này để AI có context tốt hơn!

---

*Auto-generated by VibeCoding*
*Update this file regularly for better AI context!*
