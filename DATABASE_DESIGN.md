# IB-SLR: Database Design, ERD & RLS Strategy
**Product Name:** IB-SLR  
**Engine:** PostgreSQL 15+ / Supabase  
**Design Version:** 1.0.0  

---

## 1. Relational Entity-Relationship Diagram (Conceptual)

```
[ users / profiles ] ──< [ workspace_members ] >── [ workspaces ]
         │                                               │
         │                                               └──< [ projects ]
         │                                                         │
         │ (project_members) ──────────────────────────────────────┤
         │                                                         │
         ├──< [ protocols ]                                        ├──< [ search_runs ]
         │         │                                               │         │
         │         ├──< [ research_questions ]                     │         └──< [ search_result_records ]
         │         └──< [ eligibility_criteria ]                   │                       │
         │                                                         ├──< [ articles ] ◄────┘
         ├──< [ screening_decisions ] ───────────────┐             │         │
         │                                           │             │         ├──< [ article_files ]
         ├──< [ extraction_values ]                  ▼             │         └──< [ duplicate_groups ]
         │         ▲                            [ screening_stages ]
         │         │                                 │
         │    [ extraction_fields ] ◄── [ extraction_templates ]
         │                                           │
         └──< [ appraisal_answers ]                  ▼
                   ▲                            [ prisma_events ] ──> [ prisma_snapshots ]
                   │
              [ appraisal_questions ] ◄── [ appraisal_frameworks ]

================================ CMS & PLATFORM DOMAIN ================================

[ site_settings ]
[ navigation_items ]
[ pages ] ──< [ page_sections ]
[ faqs ]
[ testimonials ]
[ pricing_plans ]
[ announcements ]
[ blog_posts ]
[ audit_logs ]
```

---

## 2. Table Schemas & Specifications

### 2.1 Identity, Tenancy & Access Control

```sql
-- Profiles linked to auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'reviewer', 'admin', 'super_admin')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspaces (Organizations / Labs)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
```

### 2.2 CMS & Public Content Model

```sql
-- Global Site Settings
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Header & Footer Navigation
CREATE TABLE navigation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL CHECK (location IN ('header', 'footer_col1', 'footer_col2', 'footer_col3', 'footer_legal')),
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_external BOOLEAN NOT NULL DEFAULT FALSE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public CMS Pages
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CMS Page Sections
CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN (
        'hero', 'feature_grid', 'workflow_steps', 'metrics_display', 
        'faq_accordion', 'pricing_table', 'testimonials', 'rich_text', 'cta_banner'
    )),
    title TEXT,
    subtitle TEXT,
    content JSONB NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FAQ Entries
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing Plans
CREATE TABLE pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier_key TEXT NOT NULL UNIQUE,
    tagline TEXT,
    price_monthly INT NOT NULL DEFAULT 0, -- in cents / smallest currency unit
    price_annual INT NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.3 Research Workspace, Protocol & Provenance

```sql
-- Research Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    review_type TEXT NOT NULL DEFAULT 'systematic_review',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Members & Roles
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'reviewer' CHECK (role IN ('lead', 'reviewer', 'adjudicator', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Protocol & Versioning
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    framework TEXT NOT NULL DEFAULT 'PICO' CHECK (framework IN ('PICO', 'PICo', 'SPIDER', 'PEO', 'custom')),
    background TEXT,
    objectives TEXT,
    pico_population TEXT,
    pico_intervention TEXT,
    pico_comparator TEXT,
    pico_outcome TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, version)
);

-- Eligibility Criteria
CREATE TABLE eligibility_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    criterion_type TEXT NOT NULL CHECK (criterion_type IN ('inclusion', 'exclusion')),
    category TEXT, -- e.g. Study Design, Population, Date Range
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.4 Search Runs, Articles & Deduplication

```sql
-- Search Executions (Provenance)
CREATE TABLE search_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_database TEXT NOT NULL, -- e.g. 'PubMed', 'Crossref', 'Manual RIS'
    query_string TEXT NOT NULL,
    filters_applied JSONB DEFAULT '{}'::jsonb,
    search_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    results_count INT NOT NULL DEFAULT 0,
    imported_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Master Reference Articles
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    normalized_title TEXT NOT NULL,
    authors TEXT,
    journal TEXT,
    publication_year INT,
    volume TEXT,
    issue TEXT,
    pages TEXT,
    doi TEXT,
    abstract TEXT,
    screening_status TEXT NOT NULL DEFAULT 'pending' CHECK (screening_status IN ('pending', 'included', 'excluded', 'unclear', 'conflict')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Duplicate Groups & Merge History
CREATE TABLE duplicate_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    survivor_article_id UUID NOT NULL REFERENCES articles(id),
    confidence_score NUMERIC(5,2),
    match_reason TEXT,
    merged_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE duplicate_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duplicate_group_id UUID NOT NULL REFERENCES duplicate_groups(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE
);
```

### 2.5 Screening & PRISMA 2020 Event Ledger

```sql
-- Screening Decisions
CREATE TABLE screening_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    stage TEXT NOT NULL CHECK (stage IN ('title_abstract', 'full_text')),
    decision TEXT NOT NULL CHECK (decision IN ('include', 'exclude', 'unclear')),
    exclusion_reason_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id, reviewer_id, stage)
);

-- PRISMA Event Ledger (Deterministic Audit Trail)
CREATE TABLE prisma_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'records_identified', 'duplicates_removed', 'records_screened',
        'records_excluded', 'reports_sought', 'reports_not_retrieved',
        'reports_assessed', 'reports_excluded_reason', 'studies_included'
    )),
    delta_count INT NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    triggered_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Row-Level Security (RLS) Strategy

All tables default to:
`ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`

### 3.1 Profiles RLS
* **Read**: Any authenticated user can read public profile data (id, full_name, avatar_url). Users can read their own sensitive fields.
* **Update**: Users can only update their own profile (`id = auth.uid()`).
* **Admin Override**: Admins can manage profile roles via dedicated server-side procedures with audit logging.

### 3.2 CMS & Public Content RLS
* **Read**: Unauthenticated (`anon`) and authenticated users can read all records where `status = 'published'` or `is_visible = true`.
* **Write**: Restricted strictly to users with `role IN ('admin', 'super_admin')`.

### 3.3 Research Tenant RLS
* **Projects**:
  ```sql
  CREATE POLICY "Project access restricted to project members" ON projects
  FOR ALL TO authenticated
  USING (
      EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.user_id = auth.uid()
      )
  );
  ```
* **Articles & Screening Decisions**:
  Access is inherited from project membership:
  ```sql
  CREATE POLICY "Articles accessible only to project members" ON articles
  FOR ALL TO authenticated
  USING (
      EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = articles.project_id
          AND project_members.user_id = auth.uid()
      )
  );
  ```
* **PDF Document Storage**:
  - Storage bucket `project-documents` is private.
  - Access granted only via short-lived signed URLs generated on the server after validating project membership.
  - Admins do **not** have bypass policies to download private project documents.
