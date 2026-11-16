# IB-SLR: System Architecture & Security Boundaries
**Product Name:** IB-SLR  
**Architecture Version:** 1.0.0  
**Target Architecture:** Multi-Tenant SaaS, Next.js App Router, PostgreSQL / Supabase, Strict RLS  

---

## 1. High-Level Architectural Diagram

```
                                      [ Browser / Client ]
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
             [ Public Marketing & CMS ]                    [ Protected App & Admin ]
             Routes: /, /features, etc.                    Routes: /app/*, /admin/*
                        │                                             │
                        │                                             │
                        ▼                                             ▼
                 Next.js SSR / ISR                         Next.js App Server Actions &
             (Read from Published CMS)                         API Routes with Guards
                        │                                             │
                        │                                             ▼
                        │                                  Session & Auth Context
                        │                                  (HTTP-only Cookies / JWT)
                        │                                             │
                        └──────────────────────┬──────────────────────┘
                                               │
                                               ▼
                              [ Application Data Access Layer ]
                           (Parameterized Queries / Supabase Client)
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
             [ PostgreSQL Database ]                         [ Object Storage ]
             - Row-Level Security (RLS)                      - Encrypted at rest
             - Multi-Tenant Schema                           - Private buckets
             - Immutable Audit Logs                          - Signed URLs only
```

---

## 2. Core Architectural Layers

### 2.1 Presentation Layer (Next.js 15+ App Router)
* **Public Domain**: High-performance Server-Side Rendered (SSR) and statically generated pages driven dynamically by the CMS database.
* **Research Workspace (`/app/*`)**: Dynamic client-server hybrid. Server Components load initial state and enforce tenant permissions; client components provide reactive screening, extraction, and synthesis interactions.
* **Admin CMS (`/admin/*`)**: Isolated administrative backoffice with strict server-side RBAC guards verifying `role = 'admin'` or `'super_admin'`.

### 2.2 Domain Logic & API Layer
* **Server Actions & Route Handlers**: Validate incoming payloads using **Zod** schemas.
* **Authentication Provider**: Session handling with HTTP-only cookies, password hashing (bcrypt), token expiration, and email verification checks.
* **Service Abstraction**:
  - `CMSContentService`: Handles retrieval, versioning (draft/published), and sanitization of public-facing content.
  - `LiteratureProviderService`: Pluggable adapter interface for academic search (PubMed, Crossref, OpenAlex).
  - `AIService`: Provider-agnostic gateway (OpenAI, Anthropic, Gemini) with mandatory schema-enforced output and evidence extraction.
  - `ExportService`: Generates validated XLSX, DOCX, and PDF artifacts.

### 2.3 Persistence & Multi-Tenancy Layer
* **Database**: PostgreSQL with UUID v4 primary keys.
* **Multi-Tenancy Model**:
  - **Workspaces**: Organizational container grouping users, projects, and billing plans.
  - **Projects**: Granular systematic literature review instances owned by a workspace.
  - **Row-Level Security (RLS)**: Enforced at the PostgreSQL engine level. Standard queries inherit `auth.uid()`, preventing cross-tenant leakage even in the event of an application logic defect.

---

## 3. Security Boundaries & Threat Modeling

```
+-----------------------------------------------------------------------------------------+
| PUBLIC BOUNDARY (Untrusted)                                                             |
| - Unauthenticated visitors                                                              |
| - Public marketing endpoints: /, /features, /pricing, etc.                              |
| - Auth endpoints with strict rate limiting: /login, /register, /forgot-password         |
+-----------------------------------------------------------------------------------------+
                                           │
                                           ▼ (Auth Check: Session + Email Verification)
+-----------------------------------------------------------------------------------------+
| RESEARCH TENANT BOUNDARY (Authenticated, Tenant-Isolated)                               |
| - Users / Researchers / Reviewers                                                       |
| - Access restricted strictly to assigned Workspaces & Projects via RLS                  |
| - Private PDFs accessible only via short-lived signed URLs                              |
| - No access to other tenants' data or platform admin settings                           |
+-----------------------------------------------------------------------------------------+
                                           │
                                           ▼ (Role Check: is_admin = true + MFA)
+-----------------------------------------------------------------------------------------+
| PLATFORM ADMIN BOUNDARY (Privileged, Audited)                                           |
| - Platform Admins / Super Admins                                                        |
| - Access to CMS content editing, user management, and system health                     |
| - ZERO default access to private research PDFs and project data                         |
| - Every admin action logged to an immutable audit_logs table                            |
+-----------------------------------------------------------------------------------------+
```

### 3.1 Authentication & Session Security
1. **Password Security**: Passwords salted and hashed with bcrypt (cost factor $\ge 12$).
2. **Session Cookies**:
   - `HttpOnly`: Mitigates XSS cookie theft.
   - `SameSite=Lax` / `Strict`: Protects against Cross-Site Request Forgery (CSRF).
   - `Secure`: Required in production (HTTPS).
3. **Email Verification**: Mandatory verification token flow; users cannot create research projects or upload literature until verification is complete.
4. **MFA Support**: TOTP (Time-based One-Time Password) capability required for administrative roles.

### 3.2 Authorization & Access Control (RBAC + Tenant Membership)
* **Roles**:
  - `visitor`: Unauthenticated public viewer.
  - `user`: Authenticated researcher. Can create workspaces and projects.
  - `reviewer`: Assigned to specific project stages with restricted blinding.
  - `admin`: Manages CMS content, users, and platform settings. No direct read access to private tenant documents.
  - `super_admin`: Full administrative oversight with mandatory audit logging.
* **Guards**: Enforced twice:
  1. Application-level middleware / server action preconditions.
  2. Database-level PostgreSQL Row-Level Security (RLS).

### 3.3 Untrusted Input & Prompt Injection Defenses
* Literature PDFs and user-supplied RIS/BibTeX files are treated as **untrusted user input**.
* Document text extracted from PDFs is sanitized and encapsulated within dedicated delimiters (`<untrusted_document_context>`) in AI prompts to prevent jailbreak or system-prompt override attempts.
* Rich text fields in the CMS are sanitized using DOMPurify / strict HTML node allowlists to prevent stored XSS attacks.

---

## 4. CMS Architecture: Data-Driven Content Management

The public website is fully decoupled from static markup. The CMS engine comprises:

1. **`site_settings`**: Global branding, site title, logo URL, contact email, social media links, and footer disclaimers.
2. **`navigation_items`**: Header and footer navigation links, ordering, and visibility flags.
3. **`pages`**: Slug-based metadata (`/`, `/features`, `/pricing`, `/about`, etc.) including SEO titles, Open Graph images, and meta descriptions.
4. **`page_sections`**: Structured content blocks belonging to a page:
   - `HERO`: Headline, subheadline, primary/secondary CTA labels & URLs, image.
   - `FEATURE_GRID`: Modular cards with title, description, and icon key.
   - `WORKFLOW_STEPS`: Sequential methodology steps (e.g. Protocol -> Search -> Screen -> Extract -> PRISMA).
   - `METRICS_DISPLAY`: Grounded operational statistics (only displayed if verified).
   - `FAQ_ACCORDION`: Categorized research Q&As.
   - `PRICING_TABLE`: Transparent tier comparisons and plan features.
   - `TESTIMONIALS`: Genuine, vetted feedback.
5. **Draft & Published Lifecycles**:
   - Editors modify `status = 'draft'`.
   - Previews render drafts via secure preview tokens.
   - Production visitors only view `status = 'published'` content.
6. **Audit & Revisions**:
   - Every CMS update creates a revision log recording `user_id`, previous state, new state, and timestamp.
