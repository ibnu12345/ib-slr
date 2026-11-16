# IB-SLR: Design System & UI Specifications
**Brand Name:** IB-SLR  
**Tagline:** *From Literature to Evidence.*  
**Design Philosophy:** Academic SaaS · Calm, Evidence-First, Restrained, High Readability  
**Target Accessibility:** WCAG 2.2 AA  

---

## 1. Design Tokens & Color Palette

The color system is engineered to foster sustained cognitive focus during demanding research workflows. Gradients, saturated accents, and loud decorative shadows are strictly avoided.

### 1.1 Core Palette

| Token Name | Hex Code | Tailwind Equivalent | Purpose / Application |
| :--- | :--- | :--- | :--- |
| **Deep Navy (Brand Primary)** | `#17324D` | `brand-navy` | Primary navigation, headers, brand emphasis, core buttons |
| **Muted Teal (Brand Accent)** | `#2F7D78` | `brand-teal` | Active tabs, key highlights, progress indicators, focused states |
| **App Background** | `#F7F8FA` | `brand-bg` | Main application backdrop, calm low-contrast canvas |
| **Surface Canvas** | `#FFFFFF` | `brand-surface` | Card surfaces, dialog backgrounds, table cell canvas |
| **Main Text** | `#17212B` | `brand-text` | Primary headings, body copy, article titles |
| **Muted Text** | `#667085` | `brand-muted` | Metadata, journal names, timestamps, secondary captions |
| **Border / Divider** | `#E4E7EC` | `brand-border` | Subtle structural division, table row borders, input outlines |

### 1.2 Semantic Feedback Palette

| Semantic Token | Hex Code | Tailwind Equivalent | Role in Research UX |
| :--- | :--- | :--- | :--- |
| **Success** | `#18794E` | `brand-success` | Study included, criteria satisfied, export completed |
| **Warning / Notice** | `#B7791F` | `brand-warning` | Dual-reviewer conflict, unclear eligibility, missing full-text |
| **Danger / Error** | `#B42318` | `brand-danger` | Study excluded, critical validation failure, deletion prompt |

---

## 2. Typography Hierarchy

IB-SLR uses **Inter** (with system font fallbacks: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) to ensure legibility across dense academic tables and long-form abstracts.

| Scale | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display-2xl` | 44px (2.75rem) | 52px | Bold (700) | Homepage Hero display headline |
| `display-xl` | 36px (2.25rem) | 44px | Bold (700) | Major landing section titles |
| `h1` | 28px (1.75rem) | 36px | SemiBold (600) | Main App dashboard & project header |
| `h2` | 22px (1.375rem) | 28px | SemiBold (600) | Module headers (Protocol, Screening, Extraction) |
| `h3` | 18px (1.125rem) | 24px | Medium (500) | Subsections, card headers, dialog titles |
| `body-base` | 14px (0.875rem) | 22px | Regular (400) | Default copy, screening abstracts, extraction notes |
| `body-sm` | 13px (0.8125rem) | 18px | Regular (400) | Table row cells, compact metadata, input hints |
| `caption` | 11px (0.6875rem) | 14px | Medium (500) | Badge labels, PRISMA node counters, timestamps |

---

## 3. Spacing, Radii & Surface Elevation

* **Spacing Grid**: Strict 4px/8px modular base scale (`space-1`: 4px, `space-2`: 8px, `space-4`: 16px, `space-6`: 24px, `space-8`: 32px, `space-12`: 48px).
* **Border Radii**:
  - Buttons, Inputs, Badges: `rounded-md` (6px) or `rounded-lg` (8px).
  - Cards, Modal Sheets, Tables: `rounded-xl` (12px).
  - Avatars & Status Pills: `rounded-full`.
* **Elevation & Shadows**:
  - Almost zero drop-shadows on flat interfaces to avoid visual noise.
  - Modals & Dropdowns: `shadow-sm` or restrained `shadow-md` with `border border-[#E4E7EC]`.

---

## 4. Academic UI Component Standards

### 4.1 Buttons & Interactive Elements
* **Primary Button**: Deep Navy `#17324D` with `#FFFFFF` text. Hover: `#12273D`.
* **Secondary Button**: White surface with `#E4E7EC` border and `#17212B` text. Hover: `#F7F8FA`.
* **Accent / Action Button**: Muted Teal `#2F7D78` with `#FFFFFF` text. Hover: `#266662`.
* **Destructive Button**: Crimson `#B42318` outline or soft tint.
* **Touch Targets & Focus States**: Minimum 40px height for primary controls, clear 2px focus ring (`ring-2 ring-brand-teal ring-offset-2`).

### 4.2 Research Table Pattern
* Dense, sticky headers with light surface `#FFFFFF` and crisp bottom border `#E4E7EC`.
* Row zebra-striping is avoided; instead, use subtle hover highlighting (`hover:bg-[#F7F8FA]`).
* Primary article title in bold `#17212B`, followed by inline author and year metadata in muted `#667085`.
* Status badges (Included, Excluded, Conflict, Pending) use subdued background tints with high-contrast text to meet WCAG AA (4.5:1 ratio).

### 4.3 Form Inputs & Feedback
* Input fields have subtle `#E4E7EC` borders that turn `#2F7D78` on active focus.
* Error states present clear descriptive error messages below the field with danger icons.
* Loading states utilize calm pulse skeletons matching the exact geometry of the loading cards or table rows.

---

## 5. Responsive Behavior & Accessibility (WCAG 2.2 AA)

1. **Responsive Viewport Adaptability**:
   - **Desktop ($\ge 1200px$)**: Full multi-column research workspace (Sidebar, Article List, Abstract Inspector, Decision Panel).
   - **Tablet ($768px - 1199px$)**: Collapsible sidebar, tabbed inspector panel.
   - **Mobile ($< 768px$)**: Bottom sheet actions, fluid stacked forms, responsive card views for tables.
2. **Keyboard Navigation**:
   - Every screening action has hotkeys (e.g. `I` for Include, `E` for Exclude, `U` for Unclear, `ArrowDown` for next article).
3. **Screen Readers**:
   - Semantic HTML5 tags (`<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`, `<footer>`).
   - Accessible ARIA labels on icon-only buttons (`aria-label="Mark study as duplicate"`).
