import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { UserProfile, UserRole } from "../types/auth";
import {
  SiteSettings,
  NavigationItem,
  CMSPage,
  PageSection,
  FAQItem,
  PricingPlan,
  TestimonialItem,
  AuditLog,
} from "../types/cms";
import {
  Workspace,
  Project,
  Protocol,
  EligibilityCriterion,
  SearchRun,
  Article,
  DuplicateCandidate,
} from "../types/research";
import {
  ScreeningDecision,
  ScreeningConflict,
  ExclusionReason,
  PrismaEvent,
  PrismaCounts,
  ScreeningStage,
  ScreeningDecisionType,
} from "../types/screening";
import {
  defaultSiteSettings,
  defaultNavigationItems,
  defaultPricingPlans,
  defaultFAQs,
  defaultTestimonials,
  defaultPages,
} from "./initialData";
import { normalizeDoi, normalizeTitle } from "../importers/parsers";
import { detectDuplicates } from "../importers/deduplication";
import { defaultExclusionReasons, calculatePrismaCounts } from "../screening/prismaLedger";

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

export interface VerificationToken {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface DatabaseSchema {
  siteSettings: SiteSettings;
  navigationItems: NavigationItem[];
  pages: CMSPage[];
  faqs: FAQItem[];
  pricingPlans: PricingPlan[];
  testimonials: TestimonialItem[];
  auditLogs: AuditLog[];
  users: StoredUser[];
  verificationTokens: VerificationToken[];
  passwordResetTokens: PasswordResetToken[];
  // Research Core
  workspaces: Workspace[];
  projects: Project[];
  protocols: Protocol[];
  eligibilityCriteria: EligibilityCriterion[];
  searchRuns: SearchRun[];
  articles: Article[];
  duplicateCandidates: DuplicateCandidate[];
  // Screening & PRISMA
  screeningDecisions: ScreeningDecision[];
  screeningConflicts: ScreeningConflict[];
  exclusionReasons: ExclusionReason[];
  prismaEvents: PrismaEvent[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let memoryDb: DatabaseSchema | null = null;

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync("AdminPass123!", adminSalt);

  const researcherSalt = bcrypt.genSaltSync(10);
  const researcherHash = bcrypt.hashSync("ResearchPass123!", researcherSalt);

  const defaultUsers: StoredUser[] = [
    {
      id: "usr-admin-1",
      email: "admin@ib-slr.local",
      fullName: "Platform Administrator",
      role: "admin",
      emailVerified: true,
      mfaEnabled: true,
      passwordHash: adminHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "usr-researcher-1",
      email: "researcher@ib-slr.local",
      fullName: "Dr. Clara Oswald",
      role: "user",
      emailVerified: true,
      mfaEnabled: false,
      passwordHash: researcherHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultWorkspaces: Workspace[] = [
    {
      id: "ws-demo-1",
      name: "Clinical Informatics & Evidence Lab",
      slug: "clinical-informatics-lab",
      ownerId: "usr-researcher-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProjects: Project[] = [
    {
      id: "prj-demo-1",
      workspaceId: "ws-demo-1",
      title: "Effectiveness of Digital Health Interventions on Glycemic Control in Adults with Type 2 Diabetes",
      description: "A systematic review and evidence synthesis evaluating mobile health apps, telemonitoring, and automated AI coaching compared with standard diabetes care.",
      reviewType: "systematic_review",
      status: "active",
      createdBy: "usr-researcher-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProtocols: Protocol[] = [
    {
      id: "proto-demo-1",
      projectId: "prj-demo-1",
      version: 1,
      framework: "PICO",
      background: "Type 2 diabetes represents a major global health burden. Digital health interventions such as smartphone self-management platforms and continuous monitoring have proliferated, but evidence on long-term HbA1c reduction remains heterogeneous.",
      objectives: "To determine whether digital health interventions improve HbA1c, self-efficacy, and treatment adherence in adults with type 2 diabetes compared with usual primary care.",
      picoPopulation: "Adults (aged 18 years and older) diagnosed with type 2 diabetes mellitus.",
      picoIntervention: "Digital health interventions including mobile applications, web-based telemonitoring, AI-based dietary coaching, and SMS reminders.",
      picoComparator: "Usual care, waitlist control, or non-digital diabetes education.",
      picoOutcome: "Primary: Glycated hemoglobin (HbA1c) reduction at >= 12 weeks. Secondary: Fasting plasma glucose, body mass index (BMI), hypoglycemia episodes, and quality of life.",
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultCriteria: EligibilityCriterion[] = [
    {
      id: "crit-inc-1",
      projectId: "prj-demo-1",
      criterionType: "inclusion",
      category: "Population",
      description: "Adults (>= 18 years) with confirmed clinical diagnosis of Type 2 Diabetes Mellitus.",
      sortOrder: 1,
    },
    {
      id: "crit-inc-2",
      projectId: "prj-demo-1",
      criterionType: "inclusion",
      category: "Study Design",
      description: "Randomized controlled trials (RCTs) with parallel or cluster designs.",
      sortOrder: 2,
    },
    {
      id: "crit-inc-3",
      projectId: "prj-demo-1",
      criterionType: "inclusion",
      category: "Intervention",
      description: "Interventions utilizing digital health tools (apps, wearable telemetry, or algorithmic feedback) for >= 12 weeks duration.",
      sortOrder: 3,
    },
    {
      id: "crit-exc-1",
      projectId: "prj-demo-1",
      criterionType: "exclusion",
      category: "Population",
      description: "Patients with Type 1 Diabetes, gestational diabetes, or secondary diabetes.",
      sortOrder: 1,
    },
    {
      id: "crit-exc-2",
      projectId: "prj-demo-1",
      criterionType: "exclusion",
      category: "Study Design",
      description: "Non-randomized observational cohorts, case reports, editorials, or conference abstracts lacking full peer review.",
      sortOrder: 2,
    },
  ];

  const defaultSearchRuns: SearchRun[] = [
    {
      id: "sr-demo-1",
      projectId: "prj-demo-1",
      sourceDatabase: "PubMed / MEDLINE",
      queryString: `("Diabetes Mellitus, Type 2"[Mesh] OR "type 2 diabetes"[tiab]) AND ("Digital Health"[tiab] OR "Mobile Applications"[Mesh] OR "Telemedicine"[Mesh] OR "smartphone app*"[tiab]) AND ("HbA1c"[tiab] OR "glycated hemoglobin"[tiab])`,
      filtersApplied: { publicationYears: "2018-2026", language: "English", articleType: "Clinical Trial, RCT" },
      searchDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      resultsCount: 3,
      importedBy: "usr-researcher-1",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const defaultArticles: Article[] = [
    {
      id: "art-1",
      projectId: "prj-demo-1",
      searchRunId: "sr-demo-1",
      title: "Mobile app-delivered self-management education versus usual care in adults with type 2 diabetes: a randomized controlled trial",
      normalizedTitle: normalizeTitle("Mobile app-delivered self-management education versus usual care in adults with type 2 diabetes: a randomized controlled trial"),
      authors: "Chen, L.; Zhang, H.; Williams, K. E.; Davies, M. J.",
      journal: "The Lancet Digital Health",
      publicationYear: 2024,
      volume: "6",
      issue: "4",
      pages: "e245-e255",
      doi: "10.1016/s2589-7500(24)00012-3",
      abstract: "Background: Mobile health technologies offer promising scalable alternatives for diabetes education. Methods: In this parallel-group RCT across 14 clinics, 340 adults with uncontrolled T2D were allocated 1:1 to a smart education app or standard clinic leaflets. Primary outcome was HbA1c at 24 weeks. Results: Mean HbA1c decreased by 0.72% in the app group vs 0.18% in control (p < 0.001).",
      screeningStatus: "pending",
      sourceDatabase: "PubMed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "art-2",
      projectId: "prj-demo-1",
      searchRunId: "sr-demo-1",
      title: "Artificial intelligence-guided glycemic telemetry in ambulatory type 2 diabetes care: A multicenter randomized trial",
      normalizedTitle: normalizeTitle("Artificial intelligence-guided glycemic telemetry in ambulatory type 2 diabetes care: A multicenter randomized trial"),
      authors: "Patel, R. N.; Gupta, S.; Thompson, J. B.",
      journal: "Diabetes Care",
      publicationYear: 2023,
      volume: "46",
      issue: "8",
      pages: "1512-1520",
      doi: "10.2337/dc23-0451",
      abstract: "Objective: To assess efficacy of an algorithmic telemetry platform providing real-time insulin dose recommendations. Research Design: 280 participants were randomized to automated telemetry or weekly nurse telephone consults for 6 months. Conclusion: AI-assisted telemetry achieved non-inferior HbA1c reduction with significantly fewer hypoglycemic events.",
      screeningStatus: "pending",
      sourceDatabase: "PubMed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "art-3",
      projectId: "prj-demo-1",
      searchRunId: "sr-demo-1",
      title: "Mobile app-delivered self-management education versus usual care in adults with type 2 diabetes: a randomized controlled trial",
      normalizedTitle: normalizeTitle("Mobile app-delivered self-management education versus usual care in adults with type 2 diabetes: a randomized controlled trial"),
      authors: "Chen, Lin; Zhang, Hua; Williams, K. E.",
      journal: "Lancet Digital Health",
      publicationYear: 2024,
      volume: "6",
      issue: "4",
      pages: "245-255",
      doi: "10.1016/s2589-7500(24)00012-3",
      abstract: "Identical duplicate record imported from Crossref bibliographic dump to demonstrate deduplication.",
      screeningStatus: "pending",
      sourceDatabase: "Crossref Import",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    siteSettings: defaultSiteSettings,
    navigationItems: defaultNavigationItems,
    pages: defaultPages,
    faqs: defaultFAQs,
    pricingPlans: defaultPricingPlans,
    testimonials: defaultTestimonials,
    auditLogs: [
      {
        id: "log-init",
        userId: "usr-admin-1",
        userEmail: "admin@ib-slr.local",
        action: "SYSTEM_INITIALIZED",
        entityType: "SYSTEM",
        entityId: "system",
        details: { message: "IB-SLR production database initialized." },
        createdAt: new Date().toISOString(),
      },
    ],
    users: defaultUsers,
    verificationTokens: [],
    passwordResetTokens: [],
    workspaces: defaultWorkspaces,
    projects: defaultProjects,
    protocols: defaultProtocols,
    eligibilityCriteria: defaultCriteria,
    searchRuns: defaultSearchRuns,
    articles: defaultArticles,
    duplicateCandidates: [],
    screeningDecisions: [],
    screeningConflicts: [],
    exclusionReasons: defaultExclusionReasons,
    prismaEvents: [
      {
        id: "ev-init-1",
        projectId: "prj-demo-1",
        eventType: "records_identified",
        deltaCount: 3,
        reason: "Initial PubMed search run import",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function getDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    ensureDirectoryExists();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      memoryDb = {
        ...getInitialDatabase(),
        ...parsed,
        workspaces: parsed.workspaces || getInitialDatabase().workspaces,
        projects: parsed.projects || getInitialDatabase().projects,
        protocols: parsed.protocols || getInitialDatabase().protocols,
        eligibilityCriteria: parsed.eligibilityCriteria || getInitialDatabase().eligibilityCriteria,
        searchRuns: parsed.searchRuns || getInitialDatabase().searchRuns,
        articles: parsed.articles || getInitialDatabase().articles,
        duplicateCandidates: parsed.duplicateCandidates || [],
        screeningDecisions: parsed.screeningDecisions || [],
        screeningConflicts: parsed.screeningConflicts || [],
        exclusionReasons: parsed.exclusionReasons || defaultExclusionReasons,
        prismaEvents: parsed.prismaEvents || getInitialDatabase().prismaEvents,
      };
      return memoryDb!;
    }
  } catch (err) {
    console.error("Failed to read DB_FILE, falling back to initial data:", err);
  }

  memoryDb = getInitialDatabase();
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    ensureDirectoryExists();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist database to disk:", err);
  }
}

// =====================================================================
// CMS OPERATIONS
// =====================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDb();
  return db.siteSettings;
}

export async function updateSiteSettings(
  settings: Partial<SiteSettings>,
  userId?: string,
  userEmail?: string
): Promise<SiteSettings> {
  const db = getDb();
  db.siteSettings = {
    ...db.siteSettings,
    ...settings,
  };
  createAuditLogSync("UPDATE_SITE_SETTINGS", "site_settings", "global", settings, userId, userEmail);
  saveDb(db);
  return db.siteSettings;
}

export async function getNavigation(
  location?: NavigationItem["location"]
): Promise<NavigationItem[]> {
  const db = getDb();
  let items = db.navigationItems.filter((i) => i.isVisible);
  if (location) {
    items = items.filter((i) => i.location === location);
  }
  return items.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllNavigationItems(): Promise<NavigationItem[]> {
  const db = getDb();
  return db.navigationItems.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveNavigationItem(
  item: NavigationItem,
  userId?: string,
  userEmail?: string
): Promise<NavigationItem> {
  const db = getDb();
  const index = db.navigationItems.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    db.navigationItems[index] = item;
    createAuditLogSync("UPDATE_NAVIGATION_ITEM", "navigation_item", item.id, item, userId, userEmail);
  } else {
    db.navigationItems.push(item);
    createAuditLogSync("CREATE_NAVIGATION_ITEM", "navigation_item", item.id, item, userId, userEmail);
  }
  saveDb(db);
  return item;
}

export async function deleteNavigationItem(
  id: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const prevCount = db.navigationItems.length;
  db.navigationItems = db.navigationItems.filter((i) => i.id !== id);
  if (db.navigationItems.length !== prevCount) {
    createAuditLogSync("DELETE_NAVIGATION_ITEM", "navigation_item", id, { id }, userId, userEmail);
    saveDb(db);
    return true;
  }
  return false;
}

export async function getPageBySlug(
  slug: string,
  includeDrafts: boolean = false
): Promise<CMSPage | null> {
  const db = getDb();
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const page = db.pages.find((p) => p.slug === normalizedSlug);
  if (!page) return null;

  if (!includeDrafts && page.status !== "published") {
    return null;
  }

  const visibleSections = includeDrafts
    ? page.sections
    : page.sections.filter((s) => s.isVisible && s.status === "published");

  return {
    ...page,
    sections: [...visibleSections].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function getAllPages(): Promise<CMSPage[]> {
  const db = getDb();
  return db.pages;
}

export async function savePage(
  page: CMSPage,
  userId?: string,
  userEmail?: string
): Promise<CMSPage> {
  const db = getDb();
  page.updatedAt = new Date().toISOString();
  const index = db.pages.findIndex((p) => p.id === page.id || p.slug === page.slug);
  if (index >= 0) {
    db.pages[index] = page;
    createAuditLogSync("UPDATE_PAGE", "page", page.id, { slug: page.slug, status: page.status }, userId, userEmail);
  } else {
    page.createdAt = new Date().toISOString();
    db.pages.push(page);
    createAuditLogSync("CREATE_PAGE", "page", page.id, { slug: page.slug }, userId, userEmail);
  }
  saveDb(db);
  return page;
}

export async function savePageSection(
  pageId: string,
  section: PageSection,
  userId?: string,
  userEmail?: string
): Promise<PageSection> {
  const db = getDb();
  const page = db.pages.find((p) => p.id === pageId);
  if (!page) throw new Error(`Page with ID ${pageId} not found.`);

  section.updatedAt = new Date().toISOString();
  const sIndex = page.sections.findIndex((s) => s.id === section.id);
  if (sIndex >= 0) {
    page.sections[sIndex] = section;
    createAuditLogSync("UPDATE_SECTION", "page_section", section.id, { pageId, type: section.sectionType }, userId, userEmail);
  } else {
    section.createdAt = new Date().toISOString();
    page.sections.push(section);
    createAuditLogSync("CREATE_SECTION", "page_section", section.id, { pageId, type: section.sectionType }, userId, userEmail);
  }
  page.updatedAt = new Date().toISOString();
  saveDb(db);
  return section;
}

export async function deletePageSection(
  pageId: string,
  sectionId: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const page = db.pages.find((p) => p.id === pageId);
  if (!page) return false;

  const countBefore = page.sections.length;
  page.sections = page.sections.filter((s) => s.id !== sectionId);
  if (page.sections.length !== countBefore) {
    createAuditLogSync("DELETE_SECTION", "page_section", sectionId, { pageId }, userId, userEmail);
    page.updatedAt = new Date().toISOString();
    saveDb(db);
    return true;
  }
  return false;
}

export async function reorderPageSections(
  pageId: string,
  orderedSectionIds: string[],
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const page = db.pages.find((p) => p.id === pageId);
  if (!page) return false;

  page.sections.forEach((s) => {
    const idx = orderedSectionIds.indexOf(s.id);
    if (idx !== -1) {
      s.sortOrder = idx + 1;
    }
  });
  page.sections.sort((a, b) => a.sortOrder - b.sortOrder);
  page.updatedAt = new Date().toISOString();
  createAuditLogSync("REORDER_SECTIONS", "page", pageId, { orderedSectionIds }, userId, userEmail);
  saveDb(db);
  return true;
}

export async function getFaqs(category?: string): Promise<FAQItem[]> {
  const db = getDb();
  let faqs = db.faqs.filter((f) => f.isPublished);
  if (category) {
    faqs = faqs.filter((f) => f.category === category);
  }
  return faqs.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllFaqs(): Promise<FAQItem[]> {
  const db = getDb();
  return db.faqs.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveFaq(faq: FAQItem, userId?: string, userEmail?: string): Promise<FAQItem> {
  const db = getDb();
  const index = db.faqs.findIndex((f) => f.id === faq.id);
  if (index >= 0) {
    db.faqs[index] = faq;
    createAuditLogSync("UPDATE_FAQ", "faq", faq.id, { question: faq.question }, userId, userEmail);
  } else {
    db.faqs.push(faq);
    createAuditLogSync("CREATE_FAQ", "faq", faq.id, { question: faq.question }, userId, userEmail);
  }
  saveDb(db);
  return faq;
}

export async function deleteFaq(id: string, userId?: string, userEmail?: string): Promise<boolean> {
  const db = getDb();
  const prevCount = db.faqs.length;
  db.faqs = db.faqs.filter((f) => f.id !== id);
  if (db.faqs.length !== prevCount) {
    createAuditLogSync("DELETE_FAQ", "faq", id, { id }, userId, userEmail);
    saveDb(db);
    return true;
  }
  return false;
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const db = getDb();
  return db.pricingPlans.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  const db = getDb();
  return db.testimonials.filter((t) => t.isApproved).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createAuditLogSync(
  action: string,
  entityType: string,
  entityId: string | undefined,
  details: Record<string, any>,
  userId?: string,
  userEmail?: string
) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userEmail,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };
  const db = getDb();
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 1000) {
    db.auditLogs.length = 1000;
  }
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const db = getDb();
  return db.auditLogs.slice(0, limit);
}

// =====================================================================
// AUTHENTICATION & USERS
// =====================================================================

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const db = getDb();
  const user = db.users.find((u) => u.id === id);
  return user || null;
}

export async function createUser(
  data: Omit<StoredUser, "id" | "createdAt" | "updatedAt">
): Promise<StoredUser> {
  const db = getDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  createAuditLogSync("USER_REGISTERED", "user", newUser.id, { email: newUser.email, role: newUser.role });
  saveDb(db);
  return newUser;
}

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const db = getDb();
  const token = `verify_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  db.verificationTokens.push({
    token,
    userId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  saveDb(db);
  return token;
}

export async function verifyEmailByToken(token: string): Promise<{ success: boolean; user?: StoredUser; error?: string }> {
  const db = getDb();
  const index = db.verificationTokens.findIndex((t) => t.token === token);
  if (index === -1) {
    return { success: false, error: "Invalid or expired email verification token." };
  }

  const item = db.verificationTokens[index];
  if (Date.now() > item.expiresAt) {
    db.verificationTokens.splice(index, 1);
    saveDb(db);
    return { success: false, error: "Email verification link has expired. Please request a new one." };
  }

  const user = await findUserById(item.userId);
  if (!user) {
    return { success: false, error: "Associated user account was not found." };
  }

  user.emailVerified = true;
  user.updatedAt = new Date().toISOString();
  db.verificationTokens.splice(index, 1);
  createAuditLogSync("EMAIL_VERIFIED", "user", user.id, { email: user.email });
  saveDb(db);
  return { success: true, user };
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const db = getDb();
  const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  db.passwordResetTokens.push({
    token,
    userId: user.id,
    expiresAt: Date.now() + 1 * 60 * 60 * 1000,
  });
  createAuditLogSync("PASSWORD_RESET_REQUESTED", "user", user.id, { email });
  saveDb(db);
  return token;
}

export async function resetPasswordWithToken(
  token: string,
  newPasswordHash: string
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const index = db.passwordResetTokens.findIndex((t) => t.token === token);
  if (index === -1) {
    return { success: false, error: "Invalid or expired password reset link." };
  }

  const item = db.passwordResetTokens[index];
  if (Date.now() > item.expiresAt) {
    db.passwordResetTokens.splice(index, 1);
    saveDb(db);
    return { success: false, error: "Password reset token has expired. Please request a new link." };
  }

  const user = await findUserById(item.userId);
  if (!user) {
    return { success: false, error: "User account no longer exists." };
  }

  user.passwordHash = newPasswordHash;
  user.updatedAt = new Date().toISOString();
  db.passwordResetTokens.splice(index, 1);
  createAuditLogSync("PASSWORD_RESET_COMPLETED", "user", user.id, { email: user.email });
  saveDb(db);
  return { success: true };
}

// =====================================================================
// RESEARCH DOMAIN: WORKSPACES & PROJECTS
// =====================================================================

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const db = getDb();
  return db.workspaces.filter((w) => w.ownerId === userId);
}

export async function getProjects(userId?: string): Promise<Project[]> {
  const db = getDb();
  if (!userId) return db.projects;
  return db.projects.filter((p) => p.createdBy === userId || p.workspaceId.includes("demo"));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = getDb();
  const project = db.projects.find((p) => p.id === id);
  return project || null;
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">,
  userId: string,
  userEmail?: string
): Promise<Project> {
  const db = getDb();
  const newProject: Project = {
    id: `prj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.push(newProject);

  const newProtocol: Protocol = {
    id: `proto-${newProject.id}`,
    projectId: newProject.id,
    version: 1,
    framework: "PICO",
    background: "",
    objectives: "",
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.protocols.push(newProtocol);

  createAuditLogSync("CREATE_PROJECT", "project", newProject.id, { title: newProject.title }, userId, userEmail);
  saveDb(db);
  return newProject;
}

// =====================================================================
// RESEARCH DOMAIN: PROTOCOL & ELIGIBILITY CRITERIA
// =====================================================================

export async function getProtocolByProjectId(projectId: string): Promise<Protocol | null> {
  const db = getDb();
  const proto = db.protocols.find((p) => p.projectId === projectId);
  return proto || null;
}

export async function saveProtocol(
  protocol: Protocol,
  userId: string,
  userEmail?: string
): Promise<Protocol> {
  const db = getDb();
  protocol.updatedAt = new Date().toISOString();
  const index = db.protocols.findIndex((p) => p.id === protocol.id || p.projectId === protocol.projectId);

  if (index >= 0) {
    if (db.protocols[index].isLocked) {
      throw new Error("This protocol version is locked. To modify criteria, please create a new version increment.");
    }
    db.protocols[index] = protocol;
    createAuditLogSync("UPDATE_PROTOCOL", "protocol", protocol.id, { version: protocol.version }, userId, userEmail);
  } else {
    protocol.createdAt = new Date().toISOString();
    db.protocols.push(protocol);
    createAuditLogSync("CREATE_PROTOCOL", "protocol", protocol.id, { version: protocol.version }, userId, userEmail);
  }
  saveDb(db);
  return protocol;
}

export async function lockProtocol(
  projectId: string,
  userId: string,
  userEmail?: string
): Promise<Protocol> {
  const db = getDb();
  const proto = db.protocols.find((p) => p.projectId === projectId);
  if (!proto) throw new Error("Protocol not found.");

  proto.isLocked = true;
  proto.lockedAt = new Date().toISOString();
  proto.lockedBy = userEmail || userId;
  proto.updatedAt = new Date().toISOString();

  createAuditLogSync("LOCK_PROTOCOL", "protocol", proto.id, { lockedAt: proto.lockedAt }, userId, userEmail);
  saveDb(db);
  return proto;
}

export async function getCriteriaByProjectId(projectId: string): Promise<EligibilityCriterion[]> {
  const db = getDb();
  return db.eligibilityCriteria.filter((c) => c.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveCriterion(
  criterion: EligibilityCriterion,
  userId?: string,
  userEmail?: string
): Promise<EligibilityCriterion> {
  const db = getDb();
  const index = db.eligibilityCriteria.findIndex((c) => c.id === criterion.id);
  if (index >= 0) {
    db.eligibilityCriteria[index] = criterion;
  } else {
    db.eligibilityCriteria.push(criterion);
  }
  createAuditLogSync("SAVE_CRITERION", "eligibility_criterion", criterion.id, criterion, userId, userEmail);
  saveDb(db);
  return criterion;
}

export async function deleteCriterion(
  id: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const countBefore = db.eligibilityCriteria.length;
  db.eligibilityCriteria = db.eligibilityCriteria.filter((c) => c.id !== id);
  if (db.eligibilityCriteria.length !== countBefore) {
    createAuditLogSync("DELETE_CRITERION", "eligibility_criterion", id, { id }, userId, userEmail);
    saveDb(db);
    return true;
  }
  return false;
}

// =====================================================================
// RESEARCH DOMAIN: SEARCH RUNS & REFERENCE INGESTION
// =====================================================================

export async function getSearchRunsByProjectId(projectId: string): Promise<SearchRun[]> {
  const db = getDb();
  return db.searchRuns.filter((s) => s.projectId === projectId).sort((a, b) => new Date(b.searchDate).getTime() - new Date(a.searchDate).getTime());
}

export async function createSearchRun(
  data: Omit<SearchRun, "id" | "createdAt">,
  userId: string,
  userEmail?: string
): Promise<SearchRun> {
  const db = getDb();
  const newRun: SearchRun = {
    id: `sr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    createdAt: new Date().toISOString(),
  };

  db.searchRuns.push(newRun);
  createAuditLogSync("CREATE_SEARCH_RUN", "search_run", newRun.id, { source: newRun.sourceDatabase, count: newRun.resultsCount }, userId, userEmail);
  saveDb(db);
  return newRun;
}

export async function getArticlesByProjectId(
  projectId: string,
  filters?: { screeningStatus?: string; search?: string }
): Promise<Article[]> {
  const db = getDb();
  let list = db.articles.filter((a) => a.projectId === projectId && !a.isDuplicate);

  if (filters?.screeningStatus && filters.screeningStatus !== "all") {
    list = list.filter((a) => a.screeningStatus === filters.screeningStatus);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.authors.toLowerCase().includes(q) ||
        (a.journal && a.journal.toLowerCase().includes(q)) ||
        (a.doi && a.doi.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function importArticlesBatch(
  projectId: string,
  parsedArticles: Array<{
    title: string;
    authors: string;
    journal?: string;
    publicationYear?: number;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    abstract?: string;
  }>,
  searchRunId?: string,
  sourceDatabase: string = "Manual Import",
  userId?: string,
  userEmail?: string
): Promise<{ importedCount: number; articles: Article[] }> {
  const db = getDb();
  const createdArticles: Article[] = [];

  for (const item of parsedArticles) {
    if (!item.title) continue;

    const newArt: Article = {
      id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      searchRunId,
      title: item.title,
      normalizedTitle: normalizeTitle(item.title),
      authors: item.authors || "Unknown Authors",
      journal: item.journal,
      publicationYear: item.publicationYear,
      volume: item.volume,
      issue: item.issue,
      pages: item.pages,
      doi: normalizeDoi(item.doi),
      abstract: item.abstract,
      screeningStatus: "pending",
      sourceDatabase,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.articles.push(newArt);
    createdArticles.push(newArt);
  }

  // Emit PRISMA event: records identified
  const prismaEvent: PrismaEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    eventType: "records_identified",
    deltaCount: createdArticles.length,
    reason: `Imported via ${sourceDatabase}`,
    triggeredBy: userEmail || userId,
    createdAt: new Date().toISOString(),
  };
  db.prismaEvents.push(prismaEvent);

  createAuditLogSync(
    "IMPORT_REFERENCES",
    "article_batch",
    projectId,
    { count: createdArticles.length, source: sourceDatabase },
    userId,
    userEmail
  );

  saveDb(db);
  return { importedCount: createdArticles.length, articles: createdArticles };
}

// =====================================================================
// RESEARCH DOMAIN: DEDUPLICATION ENGINE
// =====================================================================

export async function runDuplicateDetection(projectId: string): Promise<DuplicateCandidate[]> {
  const db = getDb();
  const projectArticles = db.articles.filter((a) => a.projectId === projectId);

  const result = detectDuplicates(projectArticles);
  const newCandidates: DuplicateCandidate[] = [];

  db.duplicateCandidates = db.duplicateCandidates.filter((c) => c.projectId !== projectId || c.status !== "pending");

  for (const pair of result.candidatePairs) {
    const candidate: DuplicateCandidate = {
      id: `dup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      articleAId: pair.articleA.id,
      articleBId: pair.articleB.id,
      confidenceScore: pair.confidenceScore,
      matchReason: pair.matchReason,
      status: "pending",
    };
    db.duplicateCandidates.push(candidate);
    newCandidates.push(candidate);
  }

  saveDb(db);
  return newCandidates;
}

export async function getDuplicateCandidates(projectId: string): Promise<Array<DuplicateCandidate & { articleA?: Article; articleB?: Article }>> {
  const db = getDb();
  const candidates = db.duplicateCandidates.filter((c) => c.projectId === projectId && c.status === "pending");

  return candidates.map((c) => ({
    ...c,
    articleA: db.articles.find((a) => a.id === c.articleAId),
    articleB: db.articles.find((a) => a.id === c.articleBId),
  }));
}

export async function mergeDuplicateArticles(
  candidateId: string,
  survivorId: string,
  duplicateId: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const survivor = db.articles.find((a) => a.id === survivorId);
  const duplicate = db.articles.find((a) => a.id === duplicateId);
  const candidate = db.duplicateCandidates.find((c) => c.id === candidateId);

  if (!survivor || !duplicate) return false;

  duplicate.isDuplicate = true;
  duplicate.mergedIntoId = survivor.id;
  duplicate.updatedAt = new Date().toISOString();

  if (candidate) {
    candidate.status = "merged";
    candidate.survivorArticleId = survivorId;
    candidate.resolvedBy = userEmail || userId;
    candidate.resolvedAt = new Date().toISOString();
  }

  // Emit PRISMA event: duplicate removed
  db.prismaEvents.push({
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId: survivor.projectId,
    eventType: "duplicates_removed",
    deltaCount: 1,
    reason: `Merged into survivor article ID ${survivor.id}`,
    triggeredBy: userEmail || userId,
    createdAt: new Date().toISOString(),
  });

  createAuditLogSync(
    "MERGE_DUPLICATES",
    "article",
    survivorId,
    { survivorId, duplicateId, candidateId },
    userId,
    userEmail
  );

  saveDb(db);
  return true;
}

export async function dismissDuplicateCandidate(
  candidateId: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const candidate = db.duplicateCandidates.find((c) => c.id === candidateId);
  if (!candidate) return false;

  candidate.status = "dismissed";
  candidate.resolvedBy = userEmail || userId;
  candidate.resolvedAt = new Date().toISOString();

  createAuditLogSync("DISMISS_DUPLICATE_CANDIDATE", "duplicate_candidate", candidateId, { candidateId }, userId, userEmail);
  saveDb(db);
  return true;
}

// =====================================================================
// SCREENING & PRISMA 2020 ENGINE
// =====================================================================

export async function getExclusionReasons(projectId: string, stage?: ScreeningStage): Promise<ExclusionReason[]> {
  const db = getDb();
  let reasons = db.exclusionReasons.filter((r) => r.projectId === "global" || r.projectId === projectId);
  if (stage) {
    reasons = reasons.filter((r) => r.stage === stage);
  }
  return reasons.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function recordScreeningDecision(
  projectId: string,
  articleId: string,
  reviewerId: string,
  reviewerName: string,
  stage: ScreeningStage,
  decision: ScreeningDecisionType,
  exclusionReason?: string,
  notes?: string
): Promise<{ decision: ScreeningDecision; status: Article["screeningStatus"] }> {
  const db = getDb();
  const article = db.articles.find((a) => a.id === articleId && a.projectId === projectId);
  if (!article) throw new Error("Article not found.");

  // Save or update decision
  const existingIndex = db.screeningDecisions.findIndex(
    (d) => d.articleId === articleId && d.reviewerId === reviewerId && d.stage === stage
  );

  const decisionRecord: ScreeningDecision = {
    id: existingIndex >= 0 ? db.screeningDecisions[existingIndex].id : `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    articleId,
    reviewerId,
    reviewerName,
    stage,
    decision,
    exclusionReason,
    notes,
    createdAt: existingIndex >= 0 ? db.screeningDecisions[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    db.screeningDecisions[existingIndex] = decisionRecord;
  } else {
    db.screeningDecisions.push(decisionRecord);
  }

  // Check for dual reviewer conflicts at this stage
  const decisionsForArticle = db.screeningDecisions.filter(
    (d) => d.articleId === articleId && d.stage === stage
  );

  let newStatus: Article["screeningStatus"] = decision === "include" ? "included" : decision === "exclude" ? "excluded" : "unclear";

  if (decisionsForArticle.length > 1) {
    const hasInclude = decisionsForArticle.some((d) => d.decision === "include");
    const hasExclude = decisionsForArticle.some((d) => d.decision === "exclude");

    if (hasInclude && hasExclude) {
      newStatus = "conflict";
      // Create conflict record if not exists
      const existingConflict = db.screeningConflicts.find(
        (c) => c.articleId === articleId && c.stage === stage && c.status === "open"
      );
      if (!existingConflict) {
        db.screeningConflicts.push({
          id: `conf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          projectId,
          articleId,
          stage,
          decisions: decisionsForArticle,
          status: "open",
        });
      }
    }
  }

  article.screeningStatus = newStatus;
  article.updatedAt = new Date().toISOString();

  // Record PRISMA event
  if (stage === "title_abstract" && decision === "exclude") {
    db.prismaEvents.push({
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      eventType: "records_excluded_title_abstract",
      deltaCount: 1,
      reason: exclusionReason || "Kriteria Umum",
      metadata: { articleId, reviewerId },
      triggeredBy: reviewerName,
      createdAt: new Date().toISOString(),
    });
  } else if (stage === "full_text" && decision === "exclude") {
    db.prismaEvents.push({
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      eventType: "reports_excluded_full_text",
      deltaCount: 1,
      reason: exclusionReason || "Kriteria Umum",
      metadata: { articleId, reviewerId },
      triggeredBy: reviewerName,
      createdAt: new Date().toISOString(),
    });
  }

  createAuditLogSync("SCREENING_DECISION", "screening_decision", decisionRecord.id, {
    articleId,
    stage,
    decision,
    exclusionReason,
  }, reviewerId, reviewerName);

  saveDb(db);
  return { decision: decisionRecord, status: newStatus };
}

export async function getScreeningConflicts(
  projectId: string,
  status: "open" | "resolved" = "open"
): Promise<Array<ScreeningConflict & { article?: Article }>> {
  const db = getDb();
  const conflicts = db.screeningConflicts.filter(
    (c) => c.projectId === projectId && c.status === status
  );

  return conflicts.map((c) => ({
    ...c,
    article: db.articles.find((a) => a.id === c.articleId),
  }));
}

export async function adjudicateConflict(
  conflictId: string,
  resolvedDecision: ScreeningDecisionType,
  exclusionReason?: string,
  adjudicatorId?: string,
  adjudicatorName?: string,
  adjudicationNotes?: string
): Promise<boolean> {
  const db = getDb();
  const conflict = db.screeningConflicts.find((c) => c.id === conflictId);
  if (!conflict) return false;

  conflict.status = "resolved";
  conflict.resolvedDecision = resolvedDecision;
  conflict.resolvedExclusionReason = exclusionReason;
  conflict.adjudicatedBy = adjudicatorName || adjudicatorId;
  conflict.adjudicationNotes = adjudicationNotes;
  conflict.resolvedAt = new Date().toISOString();

  const article = db.articles.find((a) => a.id === conflict.articleId);
  if (article) {
    article.screeningStatus = resolvedDecision === "include" ? "included" : resolvedDecision === "exclude" ? "excluded" : "unclear";
    article.updatedAt = new Date().toISOString();
  }

  createAuditLogSync("ADJUDICATE_CONFLICT", "screening_conflict", conflictId, {
    resolvedDecision,
    exclusionReason,
    adjudicationNotes,
  }, adjudicatorId, adjudicatorName);

  saveDb(db);
  return true;
}

export async function getPrismaEvents(projectId: string): Promise<PrismaEvent[]> {
  const db = getDb();
  return db.prismaEvents.filter((e) => e.projectId === projectId);
}

export async function getProjectPrismaCounts(projectId: string): Promise<PrismaCounts> {
  const db = getDb();
  const events = db.prismaEvents.filter((e) => e.projectId === projectId);
  const articles = db.articles.filter((a) => a.projectId === projectId);

  return calculatePrismaCounts(events, articles);
}
