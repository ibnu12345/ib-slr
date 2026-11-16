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
  defaultSiteSettings,
  defaultNavigationItems,
  defaultPricingPlans,
  defaultFAQs,
  defaultTestimonials,
  defaultPages,
} from "./initialData";

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
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// In-memory cache for fast hot-reload performance
let memoryDb: DatabaseSchema | null = null;

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  // Pre-hashed password: "AdminPass123!" and "ResearchPass123!"
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
        details: { message: "IB-SLR production database initialized with default academic CMS content." },
        createdAt: new Date().toISOString(),
      },
    ],
    users: defaultUsers,
    verificationTokens: [],
    passwordResetTokens: [],
  };
}

export function getDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    ensureDirectoryExists();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      memoryDb = JSON.parse(raw);
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
  createAuditLogSync(
    "UPDATE_SITE_SETTINGS",
    "site_settings",
    "global",
    settings,
    userId,
    userEmail
  );
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

  // Filter sections if not including drafts
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

export async function savePricingPlan(plan: PricingPlan, userId?: string, userEmail?: string): Promise<PricingPlan> {
  const db = getDb();
  const index = db.pricingPlans.findIndex((p) => p.id === plan.id);
  if (index >= 0) {
    db.pricingPlans[index] = plan;
    createAuditLogSync("UPDATE_PRICING", "pricing_plan", plan.id, plan, userId, userEmail);
  } else {
    db.pricingPlans.push(plan);
    createAuditLogSync("CREATE_PRICING", "pricing_plan", plan.id, plan, userId, userEmail);
  }
  saveDb(db);
  return plan;
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  const db = getDb();
  return db.testimonials.filter((t) => t.isApproved).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllTestimonials(): Promise<TestimonialItem[]> {
  const db = getDb();
  return db.testimonials.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveTestimonial(
  item: TestimonialItem,
  userId?: string,
  userEmail?: string
): Promise<TestimonialItem> {
  const db = getDb();
  const index = db.testimonials.findIndex((t) => t.id === item.id);
  if (index >= 0) {
    db.testimonials[index] = item;
    createAuditLogSync("UPDATE_TESTIMONIAL", "testimonial", item.id, item, userId, userEmail);
  } else {
    db.testimonials.push(item);
    createAuditLogSync("CREATE_TESTIMONIAL", "testimonial", item.id, item, userId, userEmail);
  }
  saveDb(db);
  return item;
}

export async function deleteTestimonial(id: string, userId?: string, userEmail?: string): Promise<boolean> {
  const db = getDb();
  const prev = db.testimonials.length;
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
  if (db.testimonials.length !== prev) {
    createAuditLogSync("DELETE_TESTIMONIAL", "testimonial", id, { id }, userId, userEmail);
    saveDb(db);
    return true;
  }
  return false;
}

// =====================================================================
// AUDIT LOGS
// =====================================================================

function createAuditLogSync(
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
  // Keep last 1000 logs
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

export async function updateUser(
  id: string,
  updates: Partial<Omit<StoredUser, "id" | "createdAt">>
): Promise<StoredUser | null> {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  db.users[index] = {
    ...db.users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  createAuditLogSync("USER_UPDATED", "user", id, updates);
  saveDb(db);
  return db.users[index];
}

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const db = getDb();
  const token = `verify_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  db.verificationTokens.push({
    token,
    userId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
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
    expiresAt: Date.now() + 1 * 60 * 60 * 1000, // 1 hour
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
