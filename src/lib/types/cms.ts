export type SectionType =
  | "hero"
  | "feature_grid"
  | "workflow_steps"
  | "metrics_display"
  | "faq_accordion"
  | "pricing_table"
  | "testimonials"
  | "rich_text"
  | "cta_banner";

export type ContentStatus = "draft" | "published" | "archived";

export interface SiteSettings {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  contactEmail: string;
  supportEmail: string;
  twitterUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  footerDisclaimer: string;
  announcement?: {
    isActive: boolean;
    message: string;
    linkUrl?: string;
    linkText?: string;
  };
}

export interface NavigationItem {
  id: string;
  location: "header" | "footer_col1" | "footer_col2" | "footer_col3" | "footer_legal";
  label: string;
  url: string;
  sortOrder: number;
  isExternal: boolean;
  isVisible: boolean;
}

export interface PageSection {
  id: string;
  pageId: string;
  sectionType: SectionType;
  title?: string;
  subtitle?: string;
  content: Record<string, any>;
  sortOrder: number;
  isVisible: boolean;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  seoMetadata: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  status: ContentStatus;
  sections: PageSection[];
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  tierKey: string;
  tagline: string;
  priceMonthly: number; // In USD or currency units
  priceAnnual: number;
  priceIdr?: string;
  billingPeriodLabel?: string;
  features: string[];
  isFeatured: boolean;
  sortOrder: number;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  institution: string;
  avatarUrl?: string;
  isApproved: boolean;
  sortOrder: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
