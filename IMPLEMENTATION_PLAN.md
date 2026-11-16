# IB-SLR: Implementation Plan & Product Roadmap
**Product Name:** IB-SLR  
**Tagline:** *From Literature to Evidence.*  
**Author:** Principal Product Engineer & Full-Stack Architect  
**Version:** 1.0.0  
**Status:** In Progress — Milestone 1 Focus  

---

## 1. Executive Summary & Philosophy

**IB-SLR** is an enterprise-grade, academic-standard SaaS platform engineered to conduct Systematic Literature Reviews (SLRs) with rigor, reproducibility, and human-in-the-loop AI assistance. 

Unlike generic chatbots or surface-level summaries, IB-SLR is an evidence-first research workspace that tracks provenance from raw query execution through PRISMA 2020 reporting. 

### Core Product Tenets
1. **Evidence-Grounded**: Every piece of AI extraction, screening assistance, or synthesis must link to verifiable article citations, page numbers, and exact excerpts. No fabricated citations or hallucinated values.
2. **Human-in-the-Loop**: AI suggests and automates drafting; verified human researchers make final screening decisions, extraction verifications, and appraisal judgments.
3. **Reproducibility & Provenance**: Complete audit trails for database searches (queries, dates, records fetched), duplicate candidate merging, screening conflicts, and PRISMA event counts.
4. **Privacy & Tenant Isolation by Default**: Strict Row-Level Security (RLS) and cryptographic isolation. Research data and private PDFs are never accessible across tenants or by platform administrators by default.
5. **Data-Driven CMS for Public Web**: All public pages, navigation, banners, copy, and FAQs are managed dynamically via a protected Admin CMS without code redeployments.
6. **Academic & Calm Design**: Modern, restrained, readable at high data densities, adhering to WCAG 2.2 AA standards.

---

## 2. Milestone Breakdown & Dependencies

```
[Milestone 0: Inspection & Foundation Architecture]
      │
      ▼
[Milestone 1: Brand, Public CMS, Dynamic Marketing Site & Auth System]
      │
      ▼
[Milestone 2: Multi-Tenant Workspace, Protocols & Literature Import Engine]
      │
      ▼
[Milestone 3: Dual-Reviewer Screening, Conflicts & PRISMA Event Engine]
      │
      ▼
[Milestone 4: Secure PDF Library, Text/OCR Pipeline & AI Evidence Studio]
      │
      ▼
[Milestone 5: Quality Appraisal Frameworks & Thematic Evidence Synthesis]
      │
      ▼
[Milestone 6: Publication Studio: PRISMA 2020 Flow, Journal Tables & Manuscript Export]
      │
      ▼
[Milestone 7: SaaS Hardening, Billing/Entitlements, Security Auditing & Release]
```

### Milestone 0: Audit, Tech Stack Inception & Architecture (Current)
* **Goal**: Establish the codebase foundation, strict contracts, schemas, security boundaries, and environment specifications.
* **Deliverables**:
  - `IMPLEMENTATION_PLAN.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `DESIGN_SYSTEM.md`, `.env.example`.
  - Next.js (App Router) + TypeScript Strict Mode + Tailwind CSS workspace initialized.
  - Database schema definitions (PostgreSQL + RLS + Migrations).
  - Test runner configured (Vitest/Jest).

### Milestone 1: Brand, Public Website, CMS & Authentication Engine
* **Goal**: Complete, production-grade public marketing presence and authentication layer where every public page element is driven by an Admin CMS.
* **Key Components**:
  - **Public Routes**: `/` (Home), `/features`, `/how-it-works`, `/for-researchers`, `/for-institutions`, `/pricing`, `/resources`, `/blog`, `/about`, `/contact`, `/privacy`, `/terms`, `/security`.
  - **Auth Routes**: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`.
  - **Admin CMS**: Protected `/admin/content/...` dashboard for managing site settings, navigation, page sections (Hero, Features, Steps, FAQ, Pricing, Testimonials), blog posts, and announcements with draft/preview/published lifecycles.
  - **Auth & Session Security**: Secure HTTP-only cookies, password hashing (bcrypt/argon2 or Supabase Auth), email verification guard, role-based middleware (`visitor`, `user`, `admin`, `super_admin`), CSRF/rate-limiting defenses.
  - **Protected Shell**: Clean `/app` dashboard entrance for verified users.

### Milestone 2: Research Workspace, Protocol Builder & Reference Engine
* **Goal**: Multi-tenant workspace, systematic review protocol definitions (PICO, PICo, SPIDER), and literature search/import provenance.
* **Key Components**:
  - Multi-tenant isolation: Workspaces, Projects, and Memberships.
  - Protocol Builder: Research questions, PICO formulation, structured eligibility criteria (inclusion/exclusion).
  - Search History: Recording exact database queries (PubMed, Crossref, OpenAlex, etc.), dates, filters, and record provenance.
  - Import Center: Robust parsers for RIS, BibTeX, and CSV formats with validation feedback.
  - Reference Library: Canonical article records, author normalization, metadata indexing.
  - Duplicate Detection: Multi-tier matching (exact DOI, normalized title, fuzzy Levenshtein similarity) with non-destructive candidate merge queues.

### Milestone 3: Screening Workflow, Dual Reviewers & PRISMA Ledger
* **Goal**: Title/abstract screening and full-text screening with blinding, conflict detection, and event-sourced PRISMA tracking.
* **Key Components**:
  - Single-reviewer & Dual-reviewer blinding modes.
  - Decision state machine: `Included`, `Excluded` (with mandatory structured reason), `Maybe/Unclear`.
  - Adjudication and conflict resolution module.
  - PRISMA 2020 Event Ledger: Real-time, mathematically auditable count transitions for records screened, duplicates removed, and reports sought/excluded.

### Milestone 4: Secure PDF Management & AI Evidence Assistant
* **Goal**: Sandboxed document storage, text extraction, and grounded AI assistant for citation-anchored Q&A.
* **Key Components**:
  - Secure PDF upload with MIME validation, size controls, and signed URLs.
  - Text extraction and layout/page chunking.
  - AI Research Assistant: Strict system prompts preventing hallucinations; structured JSON responses requiring page numbers, section headers, and verbatim quotes.
  - Fallback logic: Clear "not reported in text" outputs when data is absent.
  - Data Extraction Studio: Configurable extraction templates and human verification queue.

### Milestone 5: Quality Appraisal & Thematic Evidence Synthesis
* **Goal**: Configurable risk-of-bias checklists and qualitative synthesis.
* **Key Components**:
  - Framework templates: JBI, CASP, RoB 2, MMAT criteria.
  - Domain-by-domain evaluation with mandatory reviewer notes and justification.
  - Thematic coding: Tagging excerpts, building thematic hierarchies, and cross-study evidence matrices.
  - Descriptive statistics: Publication timelines, geographic distributions, methodology graphs.

### Milestone 6: Publication Studio & Export Engine
* **Goal**: Interactive PRISMA 2020 flow generation, formatted journal tables, and manuscript drafting.
* **Key Components**:
  - Interactive SVG/Canvas PRISMA 2020 diagram synced with the event ledger.
  - Journal table builder (Study Characteristics, Methodological Appraisal, Extraction Matrix).
  - High-fidelity export adapters: Excel (.xlsx via ExcelJS), Word (.docx), CSV, and PDF.
  - Manuscript drafting workspace with grounded citation injection.

### Milestone 7: SaaS Hardening, Enterprise Operations & Launch
* **Goal**: Production readiness, monitoring, rate-limiting, and billing architecture.
* **Key Components**:
  - Usage tracking (AI token/page quotas, project limits, storage).
  - Security audit: CSRF, CSP headers, rate-limiting on sensitive endpoints.
  - Automated backup schedules and point-in-time recovery runbooks.
  - Final WCAG 2.2 AA accessibility and cross-browser testing.

---

## 3. Risk Matrix & Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **AI Hallucinations in Medical/Scientific Reviews** | High | Medium | Strict prompt constraints: AI only drafts; evidence quotes and page numbers mandatory. "Not reported" explicitly returned if unverified. |
| **Cross-Tenant Data Leakage** | High | Low | PostgreSQL Row-Level Security (RLS) enabled on all project and reference tables. Tenant ID validation enforced in application middleware and database policies. |
| **Malicious File Uploads / Prompt Injections** | High | Medium | Strict MIME checks, sanitized text parsing, treating PDF contents as untrusted text within isolated prompt blocks. |
| **Inaccurate PRISMA Counts** | High | Medium | Immutable PRISMA event ledger; counts derived deterministically from state transitions rather than ad-hoc aggregation. |
| **Rate Limit / AI Provider Downtime** | Medium | Medium | Provider abstraction layer supporting OpenAI, Anthropic, and Google Gemini with graceful fallback and retry backoff. |

---

## 4. Milestone 1 Acceptance Criteria

1. **Brand Consistency**: The name **IB-SLR** and tagline *"From Literature to Evidence"* are reflected across all views, metadata, and assets.
2. **Public Website**: All 16 public routes are implemented with academic, clean UI styling.
3. **Data-Driven CMS**:
   - Site settings (brand, tagline, contact email, social links, footer) are editable via Admin CMS.
   - Page sections (Hero headline, description, CTAs, features, workflow steps, FAQ, pricing) are stored in the database and updated in real-time.
   - Admin CMS provides Draft vs. Published toggling and audit logging.
4. **Authentication & Authorization**:
   - User registration with name, email, password, and terms acceptance.
   - Email verification enforcement before research workspace activation.
   - Login, logout, password reset flow.
   - Role-based route protection: `/admin` is forbidden to standard users; `/app` requires active session and email verification.
5. **Security**:
   - Password hashing with industry-standard bcrypt/argon2.
   - Secure HTTP-only cookies for session handling.
   - XSS sanitization on rich CMS content.
6. **Verification & Tests**:
   - Unit/integration tests verifying auth boundaries, CMS data retrieval, and route protection.
   - Build compiles with zero TypeScript errors.
