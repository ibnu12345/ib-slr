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
  ExtractionTemplate,
  ExtractedDataRecord,
  ExtractionField,
  FieldVerificationState,
} from "../types/extraction";
import {
  AIScreeningSuggestion,
  AIExtractionSuggestion,
} from "../types/ai";
import { AppraisalRecord } from "../types/appraisal";
import { ThematicCode, ThematicExcerpt, SynthesisSummary } from "../types/synthesis";
import { ProjectManuscript, JournalTableDefinition } from "../types/publication";
import { PaymentOrder } from "../types/payment";
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
import {
  isSupabaseConfigured,
  saveStateToSupabase,
  loadStateFromSupabase,
  saveProjectDecisionsToSupabase,
  loadProjectDecisionsFromSupabase,
  saveProjectAppraisalsToSupabase,
  loadProjectAppraisalsFromSupabase,
  saveProjectExtractionsToSupabase,
  loadProjectExtractionsFromSupabase,
} from "./supabaseSync";

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
  // Extraction & AI
  extractionTemplates: ExtractionTemplate[];
  extractedDataRecords: ExtractedDataRecord[];
  aiScreeningSuggestions: AIScreeningSuggestion[];
  // Appraisal & Synthesis
  appraisalRecords: AppraisalRecord[];
  thematicCodes: ThematicCode[];
  thematicExcerpts: ThematicExcerpt[];
  // Publication & Manuscript
  manuscripts: ProjectManuscript[];
  tableDefinitions: JournalTableDefinition[];
  // Payment & Top-Up
  paymentOrders: PaymentOrder[];
}

const ROOT_DATA_DIR = path.join(process.cwd(), ".data");
const ROOT_DB_FILE = path.join(ROOT_DATA_DIR, "db.json");

// On Vercel serverless environment, use /tmp for write operations
const IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_VERCEL ? path.join("/tmp", ".data") : ROOT_DATA_DIR;
const DB_FILE = path.join(DATA_DIR, "db.json");

let memoryDb: DatabaseSchema | null = null;
let lastDbMtime = 0;

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // On Vercel, copy the bundled seed db.json from project root to /tmp on initial start
  if (IS_VERCEL && !fs.existsSync(DB_FILE) && fs.existsSync(ROOT_DB_FILE)) {
    try {
      fs.copyFileSync(ROOT_DB_FILE, DB_FILE);
    } catch (err) {
      console.warn("Could not copy bundled db.json to /tmp:", err);
    }
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
      id: "usr-admin-owner",
      email: "admin@ib-slr.com",
      fullName: "Super Administrator (Owner)",
      role: "super_admin",
      emailVerified: true,
      mfaEnabled: true,
      passwordHash: adminHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "usr-pro-vip",
      email: "pro@ib-slr.com",
      fullName: "Dr. Ibnu (Pro VIP Researcher)",
      role: "user",
      emailVerified: true,
      mfaEnabled: false,
      passwordHash: bcrypt.hashSync("ProPass123!", adminSalt),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "usr-ibnu-owner",
      email: "ibnusetiawan1928@gmail.com",
      fullName: "Ibnu Setiawan (Platform Owner)",
      role: "super_admin",
      emailVerified: true,
      mfaEnabled: false,
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
      pdfUrl: "/sample-papers/chen-2024-lancet-digital.pdf",
      pdfFileName: "Chen_2024_LancetDigitalHealth_T2D_RCT.pdf",
      pdfFileSize: 1482000,
      pageCount: 5,
      ocrQuality: "native",
      textSections: [
        {
          title: "Abstract & Background",
          pageNumber: 1,
          content: "Mobile app-delivered self-management education versus usual care in adults with type 2 diabetes: a randomized controlled trial.\n\nBackground: Mobile health technologies offer promising scalable alternatives for diabetes education. However, evidence regarding sustained glycemic control in real-world outpatient settings remains scarce. We hypothesized that an interactive smartphone-delivered self-management platform would result in clinically meaningful HbA1c reductions compared to standard printed clinic education.",
        },
        {
          title: "Methods & Participants",
          pageNumber: 2,
          content: "Trial Design and Setting: We conducted an open-label, multicenter, parallel-group randomized controlled trial across 14 ambulatory diabetes clinics in China between January 2022 and September 2023.\n\nParticipants: Eligible individuals were adults aged 18 to 75 years diagnosed with uncontrolled Type 2 Diabetes for at least 6 months, possessing a baseline HbA1c between 7.5% and 11.0% (58–97 mmol/mol), and owning a smartphone. Exclusion criteria included Type 1 Diabetes, gestational diabetes, severe renal impairment (eGFR < 30 mL/min/1.73m2), or active participation in another telemedicine intervention. A total of 340 participants were recruited and randomized 1:1.",
        },
        {
          title: "Interventions & Comparators",
          pageNumber: 3,
          content: "Intervention Group (n=170): Participants received the 'DiaSmart' smartphone application providing interactive glucose tracking, algorithm-assisted dietary coaching, physical activity logging, and push-notification medication reminders. Weekly educational modules covered carbohydrate counting, hypoglycemia recognition, and foot care.\n\nControl Group (n=170): Participants received standard clinic leaflets covering routine self-management and continued usual ambulatory care with recommended quarterly physician check-ups.",
        },
        {
          title: "Outcomes & Results",
          pageNumber: 4,
          content: "Primary Outcome: The primary outcome was change in glycated hemoglobin (HbA1c) from baseline to 24 weeks.\n\nResults: Among the 340 participants randomized (mean age 54.2 years, 48% female, mean baseline HbA1c 8.4%), 322 completed the 24-week follow-up. In intention-to-treat analysis, mean HbA1c decreased by 0.72% (95% CI: -0.89 to -0.55) in the mobile app group versus 0.18% (95% CI: -0.34 to -0.02) in the control group. The adjusted between-group difference was -0.54% (95% CI: -0.73 to -0.35, p < 0.001). Total follow-up duration was 24 weeks.",
        },
        {
          title: "Discussion & Limitations",
          pageNumber: 5,
          content: "Discussion: Smartphone-delivered self-management education achieved clinically meaningful and statistically significant glycemic improvements in adults with type 2 diabetes over 24 weeks without increasing severe hypoglycemia.\n\nLimitations: Participant blinding was not feasible due to the behavioral nature of the digital intervention. Furthermore, long-term durability beyond 24 weeks warrants further investigation in pragmatic community cohorts.",
        },
      ],
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
      pdfUrl: "/sample-papers/patel-2023-diabetes-care.pdf",
      pdfFileName: "Patel_2023_DiabetesCare_AI_Telemetry.pdf",
      pdfFileSize: 1890000,
      pageCount: 5,
      ocrQuality: "native",
      textSections: [
        {
          title: "Objective & Abstract",
          pageNumber: 1,
          content: "Artificial intelligence-guided glycemic telemetry in ambulatory type 2 diabetes care: A multicenter randomized trial.\n\nObjective: To determine whether an algorithmic telemetry platform providing real-time insulin titration advice safely reduces HbA1c compared with standard weekly nurse telephone consultations in patients with insulin-treated type 2 diabetes.",
        },
        {
          title: "Design & Participants",
          pageNumber: 2,
          content: "Methods: In this 26-week multicenter trial across 8 academic medical centers in the United States, 280 adults with suboptimally controlled type 2 diabetes on basal-bolus or basal-plus insulin were randomized to AI-guided telemetry (n=140) or nurse telephone titration (n=140). Participants had a mean age of 58.1 years (52% female, mean baseline HbA1c 8.9%).",
        },
        {
          title: "Telemetry vs Control",
          pageNumber: 3,
          content: "Intervention: Automated cellular glucometers transmitted readings to an FDA-cleared clinical decision support engine that calculated weekly basal and bolus insulin adjustments. Control: Participants submitted weekly glucose logs and received weekly structured nurse telephone consultations.",
        },
        {
          title: "Results & Glycemic Metrics",
          pageNumber: 4,
          content: "Results: At 6 months (26 weeks), mean HbA1c decreased by 1.05% in the AI telemetry arm versus 0.98% in the nurse consultation arm (difference -0.07%, 95% CI: -0.29 to 0.15, meeting predefined non-inferiority margin of 0.3%). Notably, level 2 hypoglycemia (<54 mg/dL) was 42% lower in the AI group (0.18 vs 0.31 events per patient-month, p = 0.012).",
        },
        {
          title: "Conclusions",
          pageNumber: 5,
          content: "Conclusions: Algorithmic insulin telemetry achieved robust glycemic control comparable to expert nurse titration while significantly reducing hypoglycemic episodes and clinical workload.",
        },
      ],
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

  const defaultExtractionTemplates: ExtractionTemplate[] = [
    {
      id: "tmpl-pico-default",
      projectId: "global",
      name: "PICO & Karakteristik Studi Review (Standar)",
      description: "Standard template for extracting participant characteristics, interventions, comparators, and clinical outcomes for systematic reviews.",
      version: 1,
      isDefault: true,
      fields: [
        {
          id: "fld-1",
          key: "study_design",
          label: "Study Design",
          type: "select",
          category: "study_characteristics",
          options: ["Parallel RCT", "Cluster RCT", "Crossover RCT", "Quasi-experimental", "Prospective Cohort"],
          required: true,
          sortOrder: 1,
        },
        {
          id: "fld-2",
          key: "sample_size",
          label: "Total Sample Size (N)",
          type: "number",
          category: "population",
          required: true,
          sortOrder: 2,
        },
        {
          id: "fld-3",
          key: "country",
          label: "Country / Setting",
          type: "text",
          category: "population",
          required: true,
          sortOrder: 3,
        },
        {
          id: "fld-4",
          key: "intervention_detail",
          label: "Intervention Description",
          type: "long_text",
          category: "interventions",
          required: true,
          sortOrder: 4,
        },
        {
          id: "fld-5",
          key: "comparator_detail",
          label: "Comparator / Control Protocol",
          type: "long_text",
          category: "interventions",
          required: true,
          sortOrder: 5,
        },
        {
          id: "fld-6",
          key: "primary_outcome",
          label: "Primary Clinical Outcome",
          type: "text",
          category: "outcomes",
          required: true,
          sortOrder: 6,
        },
        {
          id: "fld-7",
          key: "follow_up_duration",
          label: "Follow-up Duration",
          type: "text",
          category: "outcomes",
          required: false,
          sortOrder: 7,
        },
        {
          id: "fld-8",
          key: "risk_of_bias_notes",
          label: "Methodological Limitations / Bias Notes",
          type: "long_text",
          category: "methodology",
          required: false,
          sortOrder: 8,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultExtractedRecords: ExtractedDataRecord[] = [
    {
      id: "rec-art-1",
      projectId: "prj-demo-1",
      articleId: "art-1",
      templateId: "tmpl-pico-default",
      values: {
        study_design: "Parallel RCT",
        sample_size: 340,
        country: "China",
        intervention_detail: "Mobile app-delivered self-management education application ('DiaSmart') providing interactive glycemic tracking, dietary coaching, and automated medication reminders.",
        comparator_detail: "Standard clinic leaflets covering routine self-management and usual ambulatory care with recommended quarterly physician check-ups.",
        primary_outcome: "Mean change in HbA1c from baseline to 24 weeks (-0.72% vs -0.18%, p < 0.001)",
        follow_up_duration: "24 weeks",
        risk_of_bias_notes: "Participant blinding was not feasible due to behavioral nature of digital intervention.",
      },
      evidence: {
        study_design: {
          quote: "We conducted an open-label, multicenter, parallel-group randomized controlled trial across 14 ambulatory diabetes clinics in China",
          pageNumber: 2,
          section: "Methods & Participants",
          confidenceRating: "high",
          isFound: true,
        },
        sample_size: {
          quote: "A total of 340 participants were recruited and randomized 1:1.",
          pageNumber: 2,
          section: "Methods & Participants",
          confidenceRating: "high",
          isFound: true,
        },
        country: {
          quote: "across 14 ambulatory diabetes clinics in China between January 2022 and September 2023.",
          pageNumber: 2,
          section: "Methods & Participants",
          confidenceRating: "high",
          isFound: true,
        },
        intervention_detail: {
          quote: "Participants received the 'DiaSmart' smartphone application providing interactive glucose tracking, algorithm-assisted dietary coaching, physical activity logging, and push-notification medication reminders.",
          pageNumber: 3,
          section: "Interventions & Comparators",
          confidenceRating: "high",
          isFound: true,
        },
        comparator_detail: {
          quote: "Participants received standard clinic leaflets covering routine self-management and continued usual ambulatory care with recommended quarterly physician check-ups.",
          pageNumber: 3,
          section: "Interventions & Comparators",
          confidenceRating: "high",
          isFound: true,
        },
        primary_outcome: {
          quote: "At 24 weeks, mean HbA1c decreased by 0.72% in the mobile app group versus 0.18% in the control group (between-group difference -0.54%, p < 0.001).",
          pageNumber: 4,
          section: "Outcomes & Results",
          confidenceRating: "high",
          isFound: true,
        },
        follow_up_duration: {
          quote: "Total follow-up duration was 24 weeks.",
          pageNumber: 4,
          section: "Outcomes & Results",
          confidenceRating: "high",
          isFound: true,
        },
        risk_of_bias_notes: {
          quote: "Participant blinding was not feasible due to the behavioral nature of the digital intervention.",
          pageNumber: 5,
          section: "Discussion & Limitations",
          confidenceRating: "high",
          isFound: true,
        },
      },
      verificationStatus: {
        study_design: "verified",
        sample_size: "verified",
        country: "verified",
        intervention_detail: "verified",
        comparator_detail: "pending",
        primary_outcome: "pending",
        follow_up_duration: "pending",
        risk_of_bias_notes: "pending",
      },
      status: "in_progress",
      extractedBy: "ai_assisted",
      verifiedBy: "Dr. Clara Oswald",
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultAppraisalRecords: AppraisalRecord[] = [
    {
      id: "app-art-1",
      projectId: "prj-demo-1",
      articleId: "art-1",
      frameworkId: "rob-2-rct",
      reviewerId: "usr-researcher-1",
      reviewerName: "Dr. Clara Oswald",
      domainAnswers: {
        d1_randomization: {
          judgment: "low_risk",
          notes: "Computer-generated randomization with allocation concealment via centralized web system.",
          evidenceQuote: "randomized 1:1 using interactive web response system",
          pageNumber: 2,
        },
        d2_deviations: {
          judgment: "some_concerns",
          notes: "Open-label behavioral trial; participants could not be blinded to mobile app vs leaflets.",
          evidenceQuote: "Participant blinding was not feasible due to behavioral nature of digital intervention.",
          pageNumber: 5,
        },
        d3_missing_data: {
          judgment: "low_risk",
          notes: "High retention: 322 of 340 (94.7%) completed follow-up with intention-to-treat analysis.",
          evidenceQuote: "322 completed the 24-week follow-up. In intention-to-treat analysis...",
          pageNumber: 4,
        },
        d4_measurement: {
          judgment: "low_risk",
          notes: "Objective laboratory assay of HbA1c analyzed in blinded centralized laboratory.",
          evidenceQuote: "Centralized enzymatic laboratory assay blinded to arm allocation.",
          pageNumber: 3,
        },
        d5_selective_reporting: {
          judgment: "low_risk",
          notes: "Pre-registered protocol results matched trial registration (NCT04812391).",
          evidenceQuote: "Trial registered at ClinicalTrials.gov (NCT04812391).",
          pageNumber: 1,
        },
      },
      overallJudgment: "some_concerns",
      overallJustification: "Studi memiliki metodologi sangat kuat namun keterbatasan blinding partisipan inheren pada intervensi digital.",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "app-art-2",
      projectId: "prj-demo-1",
      articleId: "art-2",
      frameworkId: "rob-2-rct",
      reviewerId: "usr-researcher-1",
      reviewerName: "Dr. Clara Oswald",
      domainAnswers: {
        d1_randomization: {
          judgment: "low_risk",
          notes: "Centralized stratified randomization across 8 academic medical centers.",
          evidenceQuote: "randomized to AI-guided telemetry (n=140) or nurse telephone titration (n=140)",
          pageNumber: 2,
        },
        d2_deviations: {
          judgment: "low_risk",
          notes: "Strict protocol adherence with algorithmic telemetry and nurse supervision.",
          evidenceQuote: "Automated cellular glucometers transmitted readings to FDA-cleared clinical decision support engine",
          pageNumber: 3,
        },
        d3_missing_data: {
          judgment: "low_risk",
          notes: "Less than 5% loss to follow-up over 26 weeks.",
          evidenceQuote: "At 6 months (26 weeks), mean HbA1c decreased by 1.05%...",
          pageNumber: 4,
        },
        d4_measurement: {
          judgment: "low_risk",
          notes: "Standardized NGSP-certified glycated hemoglobin assay.",
          evidenceQuote: "standardized HbA1c measurements",
          pageNumber: 2,
        },
        d5_selective_reporting: {
          judgment: "low_risk",
          notes: "Pre-specified non-inferiority margin of 0.3% reported transparently.",
          evidenceQuote: "meeting predefined non-inferiority margin of 0.3%",
          pageNumber: 4,
        },
      },
      overallJudgment: "low_risk",
      overallJustification: "Multicenter RCT dengan kontrol metodologis komprehensif dan pelaporan terdaftar.",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultThematicCodes: ThematicCode[] = [
    {
      id: "thm-1",
      projectId: "prj-demo-1",
      name: "Interaktivitas & Keterlibatan Digital (Engagement)",
      color: "#2F7D78",
      category: "Karakteristik Intervensi",
      description: "Fitur aplikasi cerdas, pelacakan harian, dan notifikasi pengingat pengobatan.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "thm-2",
      projectId: "prj-demo-1",
      name: "Penurunan HbA1c & Kontrol Glikemik",
      color: "#18794E",
      category: "Efektivitas Klinis",
      description: "Perubahan rerata HbA1c terukur secara signifikan dibandingkan kontrol standar.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "thm-3",
      projectId: "prj-demo-1",
      name: "Keamanan Hipoglikemia & Pengurangan Risiko",
      color: "#B7791F",
      category: "Keamanan Pasien",
      description: "Insidensi hipoglikemia berat level 2 dan pencegahan kejadian akut.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "thm-4",
      projectId: "prj-demo-1",
      name: "Efisiensi Beban Klinis & Telemetri Real-time",
      color: "#17324D",
      category: "Implementasi Layanan Kesehatan",
      description: "Integrasi sistem telemetri otomatis dan pengurangan kunjungan tatap muka.",
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultThematicExcerpts: ThematicExcerpt[] = [
    {
      id: "exc-thm-1",
      projectId: "prj-demo-1",
      articleId: "art-1",
      codeId: "thm-1",
      verbatimQuote: "Participants received the 'DiaSmart' smartphone application providing interactive glucose tracking, algorithm-assisted dietary coaching, physical activity logging, and push-notification medication reminders.",
      pageNumber: 3,
      sectionTitle: "Interventions & Comparators",
      notes: "Contoh penerapan modul gamifikasi dan pengingat digital interaktif.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "exc-thm-2",
      projectId: "prj-demo-1",
      articleId: "art-1",
      codeId: "thm-2",
      verbatimQuote: "At 24 weeks, mean HbA1c decreased by 0.72% in the mobile app group versus 0.18% in the control group (between-group difference -0.54%, p < 0.001).",
      pageNumber: 4,
      sectionTitle: "Outcomes & Results",
      notes: "Efektivitas klinis signifikan pada penurunan HbA1c.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "exc-thm-3",
      projectId: "prj-demo-1",
      articleId: "art-2",
      codeId: "thm-3",
      verbatimQuote: "Notably, level 2 hypoglycemia (<54 mg/dL) was 42% lower in the AI group (0.18 vs 0.31 events per patient-month, p = 0.012).",
      pageNumber: 4,
      sectionTitle: "Results & Safety Outcomes",
      notes: "Penurunan kejadian hipoglikemia berkat algoritma penyesuaian dosis insulin otomatis.",
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultManuscripts: ProjectManuscript[] = [
    {
      id: "ms-demo-1",
      projectId: "prj-demo-1",
      title: "Digital Health and Smartphone-Delivered Interventions for Glycemic Control in Adults with Type 2 Diabetes: A Systematic Review and Evidence Synthesis",
      targetJournal: "The Lancet Digital Health / JMIR",
      sections: {
        abstract: "Background: Mobile health technologies offer promising scalable alternatives for diabetes self-management. Methods: We conducted a systematic literature review following PRISMA 2020 guidelines across PubMed, Crossref, and clinical trial registries. Results: Out of 3 screened reports, randomized trials evaluating interactive mobile applications ('DiaSmart') and algorithmic telemetry demonstrated clinically meaningful HbA1c reductions (-0.54% to -0.72%) over 24-26 weeks. Conclusion: Smartphone self-management education significantly improves glycemic control among ambulatory adults with type 2 diabetes.",
        introduction: "Type 2 diabetes mellitus is a chronic metabolic disorder affecting hundreds of millions worldwide. Despite effective pharmacotherapy, consistent patient self-management—including dietary adherence, physical activity, and glucose monitoring—remains the cornerstone of glycemic control. Digital health interventions, particularly smartphone applications with behavioral prompts and telemedicine feedback, have emerged as scalable strategies.",
        methods: "This systematic review was conducted in strict accordance with the PRISMA 2020 statement. Literature searches were conducted in PubMed/MEDLINE and bibliographic databases for randomized controlled trials comparing digital self-management applications against usual ambulatory care in adults aged >= 18 with uncontrolled Type 2 Diabetes. Methodological risk of bias was assessed using the Cochrane RoB 2 instrument.",
        results: "Literature search and deduplication yielded eligible reports. In the primary trial by Chen et al. (2024; N=340), mobile app education led to a statistically significant decrease in HbA1c (-0.72% vs -0.18%, p < 0.001). Patel et al. (2023; N=280) confirmed non-inferiority of algorithmic telemetry compared to nurse phone titration with 42% fewer hypoglycemic episodes.",
        risk_of_bias: "Using the Cochrane RoB 2 framework, trials exhibited low risk of bias in randomization, missing outcome data, and selective outcome reporting. Due to the overt nature of behavioral digital health apps, blinding of participants was not feasible, leading to some concerns in Domain 2 (deviations from intended interventions).",
        discussion: "Our synthesis demonstrates that smartphone-delivered interventions and algorithmic telemetry achieve robust glycemic improvements comparable or superior to traditional outpatient leaflets. Strengths include rigorous RCT designs and objective biomarker assays (HbA1c). Limitations include the scarcity of pragmatic follow-up beyond 6 months.",
        conclusion: "Interactive mobile health applications represent effective, scalable, and safe adjuncts for ambulatory type 2 diabetes care. Future pragmatic multicenter trials should evaluate long-term durability and cost-effectiveness in diverse socioeconomic populations.",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultTableDefinitions: JournalTableDefinition[] = [
    {
      id: "tbl-def-1",
      projectId: "prj-demo-1",
      tableType: "characteristics",
      title: "Table 1. Baseline Characteristics and Methodological Design of Included Trials",
      caption: "Summary of study design, sample size, participant demographics, and interventions evaluated in eligible randomized trials.",
      columns: [
        { key: "study_id", label: "Study Reference", visible: true },
        { key: "country", label: "Country / Setting", visible: true },
        { key: "sample_size", label: "Sample Size (N)", visible: true },
        { key: "intervention_detail", label: "Intervention Protocol", visible: true },
        { key: "comparator_detail", label: "Control Protocol", visible: true },
        { key: "primary_outcome", label: "Primary Outcome", visible: true },
        { key: "follow_up_duration", label: "Follow-up", visible: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tbl-def-2",
      projectId: "prj-demo-1",
      tableType: "risk_of_bias",
      title: "Table 2. Cochrane Risk of Bias 2 (RoB 2) Methodological Quality Assessment",
      caption: "Domain-by-domain evaluation of randomized controlled trials included in the systematic review.",
      columns: [
        { key: "study_id", label: "Study", visible: true },
        { key: "d1", label: "D1: Randomization", visible: true },
        { key: "d2", label: "D2: Deviations", visible: true },
        { key: "d3", label: "D3: Missing Data", visible: true },
        { key: "d4", label: "D4: Measurement", visible: true },
        { key: "d5", label: "D5: Selective Reporting", visible: true },
        { key: "overall", label: "Overall Risk", visible: true },
      ],
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
    extractionTemplates: defaultExtractionTemplates,
    extractedDataRecords: defaultExtractedRecords,
    aiScreeningSuggestions: [],
    appraisalRecords: defaultAppraisalRecords,
    thematicCodes: defaultThematicCodes,
    thematicExcerpts: defaultThematicExcerpts,
    manuscripts: defaultManuscripts,
    tableDefinitions: defaultTableDefinitions,
    paymentOrders: [],
  };
}

export function getDb(): DatabaseSchema {
  try {
    ensureDirectoryExists();
    const targetFile = fs.existsSync(DB_FILE) ? DB_FILE : fs.existsSync(ROOT_DB_FILE) ? ROOT_DB_FILE : null;
    if (targetFile && fs.existsSync(targetFile)) {
      const stat = fs.statSync(targetFile);
      if (memoryDb && stat.mtimeMs === lastDbMtime) {
        return memoryDb;
      }
      const raw = fs.readFileSync(targetFile, "utf-8");
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
        extractionTemplates: parsed.extractionTemplates || getInitialDatabase().extractionTemplates,
        extractedDataRecords: parsed.extractedDataRecords || getInitialDatabase().extractedDataRecords,
        aiScreeningSuggestions: parsed.aiScreeningSuggestions || [],
        appraisalRecords: parsed.appraisalRecords || getInitialDatabase().appraisalRecords,
        thematicCodes: parsed.thematicCodes || getInitialDatabase().thematicCodes,
        thematicExcerpts: parsed.thematicExcerpts || getInitialDatabase().thematicExcerpts,
        manuscripts: parsed.manuscripts || getInitialDatabase().manuscripts,
        tableDefinitions: parsed.tableDefinitions || getInitialDatabase().tableDefinitions,
        paymentOrders: parsed.paymentOrders || [],
      };
      lastDbMtime = stat.mtimeMs;
      return memoryDb!;
    }
  } catch (err) {
    if (memoryDb) {
      return memoryDb;
    }
    console.error("Failed to read DB_FILE, falling back to initial data:", err);
  }

  if (memoryDb) return memoryDb;
  memoryDb = getInitialDatabase();
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    ensureDirectoryExists();
    const tmp = `${DB_FILE}.tmp.${process.pid}.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    try {
      if (fs.existsSync(DB_FILE)) {
        fs.unlinkSync(DB_FILE);
      }
      fs.renameSync(tmp, DB_FILE);
    } catch {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      try {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      } catch {}
    }
    if (fs.existsSync(DB_FILE)) {
      lastDbMtime = fs.statSync(DB_FILE).mtimeMs;
    }
  } catch (err) {
    console.error("Failed to persist database to disk:", err);
  }

  // Auto-sync to Supabase Cloud with debounce to avoid hammering cloud API on fast screening
  if (isSupabaseConfigured()) {
    triggerDebouncedSupabaseSave(data);
  }
}

let supabaseSaveTimer: NodeJS.Timeout | null = null;
let latestDataToPersist: DatabaseSchema | null = null;

export function triggerDebouncedSupabaseSave(data: DatabaseSchema) {
  latestDataToPersist = data;
  if (!isSupabaseConfigured()) return;
  if (supabaseSaveTimer) clearTimeout(supabaseSaveTimer);
  supabaseSaveTimer = setTimeout(() => {
    if (latestDataToPersist) {
      saveStateToSupabase(latestDataToPersist).catch((err) => {
        console.warn("Supabase debounced sync warning:", err);
      });
    }
  }, 1200);
}

let lastSupabaseSync = 0;
const SYNC_DEBOUNCE_MS = 15000;

export async function syncFromSupabase(force = false): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const now = Date.now();
  if (force || now - lastSupabaseSync > SYNC_DEBOUNCE_MS) {
    lastSupabaseSync = now;
    try {
      const remote = await loadStateFromSupabase();
      if (remote) {
        memoryDb = {
          ...getInitialDatabase(),
          ...remote,
          workspaces: remote.workspaces || getInitialDatabase().workspaces,
          projects: remote.projects || getInitialDatabase().projects,
          protocols: remote.protocols || getInitialDatabase().protocols,
          eligibilityCriteria: remote.eligibilityCriteria || getInitialDatabase().eligibilityCriteria,
          searchRuns: remote.searchRuns || getInitialDatabase().searchRuns,
          articles: remote.articles || getInitialDatabase().articles,
          duplicateCandidates: remote.duplicateCandidates || [],
          screeningDecisions: remote.screeningDecisions || [],
          screeningConflicts: remote.screeningConflicts || [],
          exclusionReasons: remote.exclusionReasons || defaultExclusionReasons,
          prismaEvents: remote.prismaEvents || getInitialDatabase().prismaEvents,
          extractionTemplates: remote.extractionTemplates || getInitialDatabase().extractionTemplates,
          extractedDataRecords: remote.extractedDataRecords || getInitialDatabase().extractedDataRecords,
          aiScreeningSuggestions: remote.aiScreeningSuggestions || [],
          appraisalRecords: remote.appraisalRecords || getInitialDatabase().appraisalRecords,
          thematicCodes: remote.thematicCodes || getInitialDatabase().thematicCodes,
          thematicExcerpts: remote.thematicExcerpts || getInitialDatabase().thematicExcerpts,
          manuscripts: remote.manuscripts || getInitialDatabase().manuscripts,
          tableDefinitions: remote.tableDefinitions || getInitialDatabase().tableDefinitions,
          users: remote.users || getInitialDatabase().users,
          paymentOrders: remote.paymentOrders || [],
        };
        try {
          ensureDirectoryExists();
          fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf-8");
          lastDbMtime = fs.statSync(DB_FILE).mtimeMs;
        } catch {}
      }
    } catch (err) {
      console.warn("Supabase sync warning:", err);
    }
  }
}

export async function saveDbAsync(data: DatabaseSchema): Promise<void> {
  saveDb(data);
  if (isSupabaseConfigured()) {
    try {
      await saveStateToSupabase(data);
    } catch (err) {
      console.warn("Supabase saveStateToSupabase error:", err);
    }
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
  let page = db.pages?.find((p) => p.slug === normalizedSlug);
  if (!page) {
    page = defaultPages.find((p) => p.slug === normalizedSlug);
  } else if (normalizedSlug === "/terms" || normalizedSlug === "/privacy" || normalizedSlug === "/pricing") {
    // Keep legal and pricing content continuously synchronized with updated standards
    const defaultPage = defaultPages.find((p) => p.slug === normalizedSlug);
    if (defaultPage) {
      page = { ...defaultPage, ...page, sections: defaultPage.sections };
    }
  }
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
  if (db.auditLogs.length > 5000) {
    db.auditLogs.length = 5000;
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
  await syncFromSupabase();
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  await syncFromSupabase();
  const db = getDb();
  const user = db.users.find((u) => u.id === id);
  return user || null;
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  return findUserById(id);
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

export function resolveProjectId(id: string): string {
  if (!id) return "";
  try {
    const clean = decodeURIComponent(id).trim();
    if (clean === "demo-1" || clean === "demo") return "prj-demo-1";
    return clean;
  } catch {
    const clean = id.trim();
    if (clean === "demo-1" || clean === "demo") return "prj-demo-1";
    return clean;
  }
}

export async function getProjects(userId?: string): Promise<Project[]> {
  await syncFromSupabase();
  const db = getDb();
  if (!userId) return db.projects;
  return db.projects.filter((p) => p.createdBy === userId);
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  return getProjects(userId);
}

export async function getProjectById(id: string): Promise<Project | null> {
  await syncFromSupabase();
  const db = getDb();
  const normalizedId = resolveProjectId(id);
  let project = db.projects.find((p) => p.id === normalizedId || p.id === id);

  if (!project) {
    await syncFromSupabase(true);
    const freshDb = getDb();
    project = freshDb.projects.find((p) => p.id === normalizedId || p.id === id);
  }

  return project || null;
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">,
  userId: string,
  userEmail?: string
): Promise<Project> {
  await syncFromSupabase();
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
    background: data.description || "",
    objectives: "",
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.protocols.push(newProtocol);

  createAuditLogSync("CREATE_PROJECT", "project", newProject.id, { title: newProject.title }, userId, userEmail);
  await saveDbAsync(db);
  return newProject;
}

// =====================================================================
// RESEARCH DOMAIN: PROTOCOL & ELIGIBILITY CRITERIA
// =====================================================================

export async function getProtocolByProjectId(projectId: string): Promise<Protocol | null> {
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);
  let proto = db.protocols.find((p) => p.projectId === id || p.projectId === projectId);

  if (!proto) {
    await syncFromSupabase(true);
    const freshDb = getDb();
    proto = freshDb.protocols.find((p) => p.projectId === id || p.projectId === projectId);
  }

  // Self-heal: If the project exists but has no protocol record yet, auto-create a default PICO protocol
  if (!proto) {
    const project = db.projects.find((p) => p.id === id || p.id === projectId);
    if (project) {
      const autoProto: Protocol = {
        id: `proto-${project.id}`,
        projectId: project.id,
        version: 1,
        framework: "PICO",
        background: project.description || "",
        objectives: "",
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.protocols.push(autoProto);
      await saveDbAsync(db);
      return autoProto;
    }
  }

  return proto || null;
}

export async function saveProtocol(
  protocol: Protocol,
  userId: string,
  userEmail?: string
): Promise<Protocol> {
  await syncFromSupabase();
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
  await saveDbAsync(db);
  return protocol;
}

export async function lockProtocol(
  projectId: string,
  userId: string,
  userEmail?: string
): Promise<Protocol> {
  await syncFromSupabase();
  const db = getDb();
  const proto = db.protocols.find((p) => p.projectId === projectId);
  if (!proto) throw new Error("Protocol not found.");

  proto.isLocked = true;
  proto.lockedAt = new Date().toISOString();
  proto.lockedBy = userEmail || userId;
  proto.updatedAt = new Date().toISOString();

  createAuditLogSync("LOCK_PROTOCOL", "protocol", proto.id, { lockedAt: proto.lockedAt }, userId, userEmail);
  await saveDbAsync(db);
  return proto;
}

export async function getCriteriaByProjectId(projectId: string): Promise<EligibilityCriterion[]> {
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);
  return db.eligibilityCriteria.filter((c) => c.projectId === id || c.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveCriterion(
  criterion: EligibilityCriterion,
  userId?: string,
  userEmail?: string
): Promise<EligibilityCriterion> {
  await syncFromSupabase();
  const db = getDb();
  const index = db.eligibilityCriteria.findIndex((c) => c.id === criterion.id);
  if (index >= 0) {
    db.eligibilityCriteria[index] = criterion;
  } else {
    db.eligibilityCriteria.push(criterion);
  }
  createAuditLogSync("SAVE_CRITERION", "eligibility_criterion", criterion.id, criterion, userId, userEmail);
  await saveDbAsync(db);
  return criterion;
}

export async function deleteCriterion(
  id: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  await syncFromSupabase();
  const db = getDb();
  const countBefore = db.eligibilityCriteria.length;
  db.eligibilityCriteria = db.eligibilityCriteria.filter((c) => c.id !== id);
  if (db.eligibilityCriteria.length !== countBefore) {
    createAuditLogSync("DELETE_CRITERION", "eligibility_criterion", id, { id }, userId, userEmail);
    await saveDbAsync(db);
    return true;
  }
  return false;
}

// =====================================================================
// RESEARCH DOMAIN: SEARCH RUNS & REFERENCE INGESTION
// =====================================================================

export async function getSearchRunsByProjectId(projectId: string): Promise<SearchRun[]> {
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);
  return db.searchRuns.filter((s) => s.projectId === id || s.projectId === projectId).sort((a, b) => new Date(b.searchDate).getTime() - new Date(a.searchDate).getTime());
}

export async function createSearchRun(
  data: Omit<SearchRun, "id" | "createdAt">,
  userId: string,
  userEmail?: string
): Promise<SearchRun> {
  await syncFromSupabase();
  const db = getDb();
  const newRun: SearchRun = {
    id: `sr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    createdAt: new Date().toISOString(),
  };

  db.searchRuns.push(newRun);
  createAuditLogSync("CREATE_SEARCH_RUN", "search_run", newRun.id, { source: newRun.sourceDatabase, count: newRun.resultsCount }, userId, userEmail);
  await saveDbAsync(db);
  return newRun;
}

export async function getArticlesByProjectId(
  projectId: string,
  filters?: { screeningStatus?: string; search?: string }
): Promise<Article[]> {
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);

  // Load project-specific decisions from Supabase cloud and merge
  try {
    const remoteDecisions = await loadProjectDecisionsFromSupabase(id);
    if (Array.isArray(remoteDecisions) && remoteDecisions.length > 0) {
      for (const rd of remoteDecisions) {
        const idx = db.screeningDecisions.findIndex(
          (d) => d.articleId === rd.articleId && d.stage === rd.stage && d.reviewerId === rd.reviewerId
        );
        if (idx >= 0) {
          db.screeningDecisions[idx] = rd;
        } else {
          db.screeningDecisions.push(rd);
        }
      }
    }
  } catch (err) {
    console.warn("Non-fatal project decisions load warning:", err);
  }

  let list = db.articles.filter((a) => (a.projectId === id || a.projectId === projectId) && !a.isDuplicate);

  const decisions = db.screeningDecisions.filter(
    (d) => d.projectId === id || d.projectId === projectId
  );

  list = list.map((a) => {
    const taDecision = decisions.find((d) => d.articleId === a.id && d.stage === "title_abstract");
    const ftDecision = decisions.find((d) => d.articleId === a.id && d.stage === "full_text");

    const titleAbstractStatus: Article["screeningStatus"] =
      a.titleAbstractStatus ||
      (taDecision
        ? taDecision.decision === "include"
          ? "included"
          : taDecision.decision === "exclude"
          ? "excluded"
          : "unclear"
        : a.screeningStatus || "pending");

    const fullTextStatus: Article["screeningStatus"] =
      a.fullTextStatus ||
      (ftDecision
        ? ftDecision.decision === "include"
          ? "included"
          : ftDecision.decision === "exclude"
          ? "excluded"
          : "unclear"
        : "pending");

    let effectiveScreeningStatus: Article["screeningStatus"] = titleAbstractStatus;
    let activeExclusionReason = a.titleAbstractExclusionReason || taDecision?.exclusionReason;

    if (fullTextStatus && fullTextStatus !== "pending") {
      effectiveScreeningStatus = fullTextStatus;
      if (fullTextStatus === "excluded") {
        activeExclusionReason = a.fullTextExclusionReason || ftDecision?.exclusionReason;
      }
    }

    return {
      ...a,
      screeningStatus: effectiveScreeningStatus,
      titleAbstractStatus,
      fullTextStatus,
      titleAbstractExclusionReason: a.titleAbstractExclusionReason || taDecision?.exclusionReason,
      fullTextExclusionReason: a.fullTextExclusionReason || ftDecision?.exclusionReason,
      activeExclusionReason,
    };
  });

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
  await syncFromSupabase();
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

  await saveDbAsync(db);
  return { importedCount: createdArticles.length, articles: createdArticles };
}

// =====================================================================
// RESEARCH DOMAIN: DEDUPLICATION ENGINE
// =====================================================================

export async function runDuplicateDetection(projectId: string): Promise<DuplicateCandidate[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  const projectArticles = db.articles.filter((a) => a.projectId === id || a.projectId === projectId);

  const result = detectDuplicates(projectArticles);
  const newCandidates: DuplicateCandidate[] = [];

  db.duplicateCandidates = db.duplicateCandidates.filter((c) => (c.projectId !== id && c.projectId !== projectId) || c.status !== "pending");

  for (const pair of result.candidatePairs) {
    const candidate: DuplicateCandidate = {
      id: `dup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: id,
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
  const id = resolveProjectId(projectId);
  const candidates = db.duplicateCandidates.filter((c) => (c.projectId === id || c.projectId === projectId) && c.status === "pending");

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
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);
  let reasons = db.exclusionReasons.filter((r) => r.projectId === "global" || r.projectId === id || r.projectId === projectId);
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
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);
  const article = db.articles.find((a) => a.id === articleId && (a.projectId === id || a.projectId === projectId));
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

  if (stage === "title_abstract") {
    article.titleAbstractStatus = newStatus;
    if (newStatus === "excluded") {
      article.screeningStatus = "excluded";
      article.titleAbstractExclusionReason = exclusionReason;
    } else {
      article.screeningStatus = newStatus;
    }
  } else if (stage === "full_text") {
    article.fullTextStatus = newStatus;
    article.fullTextExclusionReason = exclusionReason;
    article.screeningStatus = newStatus;
  } else {
    article.screeningStatus = newStatus;
  }
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

  // Directly await saving project decisions to Supabase (<250ms) so Vercel serverless never drops it!
  try {
    const projDecisions = db.screeningDecisions.filter(
      (d) => d.projectId === id || d.projectId === projectId
    );
    await saveProjectDecisionsToSupabase(id, projDecisions);
  } catch (err) {
    console.warn("Failed to persist project decisions to Supabase:", err);
  }

  return { decision: decisionRecord, status: newStatus };
}

export async function recordScreeningDecisionsBatch(
  projectId: string,
  stage: ScreeningStage,
  decisions: Array<{ articleId: string; decision: ScreeningDecisionType; exclusionReason?: string; notes?: string }>,
  reviewerId: string,
  reviewerName: string
): Promise<{ count: number }> {
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);

  for (const item of decisions) {
    const article = db.articles.find((a) => a.id === item.articleId && (a.projectId === id || a.projectId === projectId));
    if (!article) continue;

    const existingIndex = db.screeningDecisions.findIndex(
      (d) => d.articleId === item.articleId && d.reviewerId === reviewerId && d.stage === stage
    );

    const decisionRecord: ScreeningDecision = {
      id: existingIndex >= 0 ? db.screeningDecisions[existingIndex].id : `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: id,
      articleId: item.articleId,
      reviewerId,
      reviewerName,
      stage,
      decision: item.decision,
      exclusionReason: item.exclusionReason,
      notes: item.notes,
      createdAt: existingIndex >= 0 ? db.screeningDecisions[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.screeningDecisions[existingIndex] = decisionRecord;
    } else {
      db.screeningDecisions.push(decisionRecord);
    }

    const newStatus: Article["screeningStatus"] = item.decision === "include" ? "included" : item.decision === "exclude" ? "excluded" : "unclear";
    if (stage === "title_abstract") {
      article.titleAbstractStatus = newStatus;
      if (newStatus === "excluded") {
        article.screeningStatus = "excluded";
        article.titleAbstractExclusionReason = item.exclusionReason;
      } else {
        article.screeningStatus = newStatus;
      }
    } else if (stage === "full_text") {
      article.fullTextStatus = newStatus;
      article.fullTextExclusionReason = item.exclusionReason;
      article.screeningStatus = newStatus;
    }
  }

  saveDb(db);

  try {
    const projDecisions = db.screeningDecisions.filter(
      (d) => d.projectId === id || d.projectId === projectId
    );
    await saveProjectDecisionsToSupabase(id, projDecisions);
  } catch (err) {
    console.warn("Failed to persist batch decisions to Supabase:", err);
  }

  return { count: decisions.length };
}

export async function getScreeningConflicts(
  projectId: string,
  status: "open" | "resolved" = "open"
): Promise<Array<ScreeningConflict & { article?: Article }>> {
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);
  const conflicts = db.screeningConflicts.filter(
    (c) => (c.projectId === id || c.projectId === projectId) && c.status === status
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
  await syncFromSupabase();
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

  await saveDbAsync(db);
  return true;
}

export async function getPrismaEvents(projectId: string): Promise<PrismaEvent[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  return db.prismaEvents.filter((e) => e.projectId === id || e.projectId === projectId);
}

export async function getProjectPrismaCounts(projectId: string): Promise<PrismaCounts> {
  await syncFromSupabase();
  const db = getDb();
  const id = resolveProjectId(projectId);
  const events = db.prismaEvents.filter((e) => e.projectId === id || e.projectId === projectId);
  const articles = await getArticlesByProjectId(projectId);

  return calculatePrismaCounts(events, articles);
}

// =====================================================================
// ARTICLE PDF & TEXT EXTRACTION OPERATIONS
// =====================================================================

export async function getArticleById(articleId: string): Promise<Article | undefined> {
  const db = getDb();
  return db.articles.find((a) => a.id === articleId);
}

export async function updateArticlePdf(
  articleId: string,
  data: {
    pdfUrl?: string;
    pdfFileName?: string;
    pdfFileSize?: number;
    extractedText?: string;
    textSections?: any[];
    pageCount?: number;
    ocrQuality?: "native" | "ocr_high" | "ocr_medium" | "unreadable";
  },
  userId?: string,
  userEmail?: string
): Promise<Article> {
  const db = getDb();
  const article = db.articles.find((a) => a.id === articleId);
  if (!article) throw new Error("Article not found.");

  if (data.pdfUrl !== undefined) article.pdfUrl = data.pdfUrl;
  if (data.pdfFileName !== undefined) article.pdfFileName = data.pdfFileName;
  if (data.pdfFileSize !== undefined) article.pdfFileSize = data.pdfFileSize;
  if (data.extractedText !== undefined) article.extractedText = data.extractedText;
  if (data.textSections !== undefined) article.textSections = data.textSections;
  if (data.pageCount !== undefined) article.pageCount = data.pageCount;
  if (data.ocrQuality !== undefined) article.ocrQuality = data.ocrQuality;
  article.updatedAt = new Date().toISOString();

  createAuditLogSync("UPDATE_ARTICLE_PDF", "article", articleId, {
    fileName: data.pdfFileName,
    fileSize: data.pdfFileSize,
    pageCount: data.pageCount,
  }, userId, userEmail);

  saveDb(db);
  return article;
}

// =====================================================================
// DATA EXTRACTION STUDIO & TEMPLATES
// =====================================================================

export async function getExtractionTemplates(projectId: string): Promise<ExtractionTemplate[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  const found = db.extractionTemplates.filter((t) => t.projectId === id || t.projectId === projectId || t.projectId === "global");
  if (found.length > 0) return found;

  // Fallback: create default template for this project
  const initial = db.extractionTemplates[0] || getInitialDatabase().extractionTemplates[0];
  const fallbackTemplate: ExtractionTemplate = {
    ...initial,
    id: `tmpl-${id}-default`,
    projectId: id,
    isDefault: true,
  };
  db.extractionTemplates.push(fallbackTemplate);
  saveDb(db);
  return [fallbackTemplate];
}

export async function getExtractionTemplateById(templateId: string): Promise<ExtractionTemplate | undefined> {
  const db = getDb();
  return db.extractionTemplates.find((t) => t.id === templateId);
}

export async function saveExtractionTemplate(
  template: ExtractionTemplate,
  userId?: string,
  userEmail?: string
): Promise<ExtractionTemplate> {
  const db = getDb();
  const index = db.extractionTemplates.findIndex((t) => t.id === template.id);
  template.updatedAt = new Date().toISOString();

  if (index >= 0) {
    db.extractionTemplates[index] = template;
    createAuditLogSync("UPDATE_EXTRACTION_TEMPLATE", "extraction_template", template.id, { name: template.name }, userId, userEmail);
  } else {
    template.createdAt = new Date().toISOString();
    db.extractionTemplates.push(template);
    createAuditLogSync("CREATE_EXTRACTION_TEMPLATE", "extraction_template", template.id, { name: template.name }, userId, userEmail);
  }

  saveDb(db);
  return template;
}

export async function getExtractedDataRecords(
  projectId: string,
  articleId?: string
): Promise<ExtractedDataRecord[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  let list = db.extractedDataRecords.filter((r) => r.projectId === id || r.projectId === projectId);
  if (list.length === 0) {
    const remote = await loadProjectExtractionsFromSupabase(id);
    if (remote && Array.isArray(remote) && remote.length > 0) {
      for (const rec of remote) {
        if (!db.extractedDataRecords.some((r) => r.id === rec.id)) {
          db.extractedDataRecords.push(rec);
        }
      }
      list = remote;
    }
  }
  if (articleId) {
    list = list.filter((r) => r.articleId === articleId);
  }
  return list;
}

export async function getExtractedDataRecordById(recordId: string): Promise<ExtractedDataRecord | undefined> {
  const db = getDb();
  return db.extractedDataRecords.find((r) => r.id === recordId);
}

export async function saveExtractedDataRecord(
  record: ExtractedDataRecord,
  userId?: string,
  userEmail?: string
): Promise<ExtractedDataRecord> {
  const db = getDb();
  const index = db.extractedDataRecords.findIndex((r) => r.id === record.id);
  record.updatedAt = new Date().toISOString();

  if (index >= 0) {
    db.extractedDataRecords[index] = record;
  } else {
    record.createdAt = new Date().toISOString();
    db.extractedDataRecords.push(record);
  }

  createAuditLogSync("SAVE_EXTRACTED_DATA", "extracted_data_record", record.id, {
    articleId: record.articleId,
    status: record.status,
  }, userId, userEmail);

  saveDb(db);
  return record;
}

export async function verifyExtractedField(
  recordId: string,
  fieldKey: string,
  status: FieldVerificationState,
  correctedValue?: any,
  verifier?: string
): Promise<ExtractedDataRecord> {
  const db = getDb();
  const record = db.extractedDataRecords.find((r) => r.id === recordId);
  if (!record) throw new Error("Extracted data record not found.");

  record.verificationStatus[fieldKey] = status;
  if (status === "corrected" && correctedValue !== undefined) {
    record.values[fieldKey] = correctedValue;
  }

  // Check if all fields in template are verified or corrected
  const allStatuses = Object.values(record.verificationStatus);
  const allDone = allStatuses.length > 0 && allStatuses.every((s) => s === "verified" || s === "corrected");
  if (allDone) {
    record.status = "verified";
    record.verifiedBy = verifier || "Reviewer";
    record.verifiedAt = new Date().toISOString();
  } else {
    record.status = "in_progress";
  }

  record.updatedAt = new Date().toISOString();
  saveDb(db);
  return record;
}

// =====================================================================
// AI EVIDENCE ASSISTANT OPERATIONS
// =====================================================================

export async function getAIScreeningSuggestion(articleId: string): Promise<AIScreeningSuggestion | undefined> {
  const db = getDb();
  return db.aiScreeningSuggestions.find((s) => s.articleId === articleId);
}

export async function saveAIScreeningSuggestion(
  suggestion: AIScreeningSuggestion
): Promise<AIScreeningSuggestion> {
  const db = getDb();
  const index = db.aiScreeningSuggestions.findIndex((s) => s.articleId === suggestion.articleId);
  if (index >= 0) {
    db.aiScreeningSuggestions[index] = suggestion;
  } else {
    db.aiScreeningSuggestions.push(suggestion);
  }
  saveDb(db);
  return suggestion;
}

// =====================================================================
// QUALITY APPRAISAL (RISK OF BIAS) OPERATIONS
// =====================================================================

export async function getAppraisalRecords(
  projectId: string,
  articleId?: string
): Promise<AppraisalRecord[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  let list = db.appraisalRecords.filter((r) => r.projectId === id || r.projectId === projectId);
  if (list.length === 0) {
    const remote = await loadProjectAppraisalsFromSupabase(id);
    if (remote && Array.isArray(remote) && remote.length > 0) {
      for (const rec of remote) {
        if (!db.appraisalRecords.some((r) => r.id === rec.id)) {
          db.appraisalRecords.push(rec);
        }
      }
      list = remote;
    }
  }
  if (articleId) {
    list = list.filter((r) => r.articleId === articleId);
  }
  return list;
}

export async function saveAppraisalRecord(
  record: AppraisalRecord,
  userId?: string,
  userEmail?: string
): Promise<AppraisalRecord> {
  const db = getDb();
  const index = db.appraisalRecords.findIndex((r) => r.id === record.id);
  record.updatedAt = new Date().toISOString();

  if (index >= 0) {
    db.appraisalRecords[index] = record;
  } else {
    record.createdAt = new Date().toISOString();
    db.appraisalRecords.push(record);
  }

  createAuditLogSync("SAVE_APPRAISAL_RECORD", "appraisal_record", record.id, {
    articleId: record.articleId,
    overallJudgment: record.overallJudgment,
    status: record.status,
  }, userId, userEmail);

  saveDb(db);
  return record;
}

// =====================================================================
// THEMATIC SYNTHESIS & QUALITATIVE CODING OPERATIONS
// =====================================================================

export async function getThematicCodes(projectId: string): Promise<ThematicCode[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  return db.thematicCodes.filter((c) => c.projectId === id || c.projectId === projectId);
}

export async function saveThematicCode(
  code: ThematicCode,
  userId?: string,
  userEmail?: string
): Promise<ThematicCode> {
  const db = getDb();
  const index = db.thematicCodes.findIndex((c) => c.id === code.id);

  if (index >= 0) {
    db.thematicCodes[index] = code;
  } else {
    code.createdAt = new Date().toISOString();
    db.thematicCodes.push(code);
  }

  createAuditLogSync("SAVE_THEMATIC_CODE", "thematic_code", code.id, { name: code.name }, userId, userEmail);
  saveDb(db);
  return code;
}

export async function deleteThematicCode(
  codeId: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const countBefore = db.thematicCodes.length;
  db.thematicCodes = db.thematicCodes.filter((c) => c.id !== codeId);
  db.thematicExcerpts = db.thematicExcerpts.filter((e) => e.codeId !== codeId);

  if (db.thematicCodes.length !== countBefore) {
    createAuditLogSync("DELETE_THEMATIC_CODE", "thematic_code", codeId, {}, userId, userEmail);
    saveDb(db);
    return true;
  }
  return false;
}

export async function getThematicExcerpts(
  projectId: string,
  articleId?: string
): Promise<ThematicExcerpt[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  let list = db.thematicExcerpts.filter((e) => e.projectId === id || e.projectId === projectId);
  if (articleId) {
    list = list.filter((e) => e.articleId === articleId);
  }
  return list;
}

export async function saveThematicExcerpt(
  excerpt: ThematicExcerpt,
  userId?: string,
  userEmail?: string
): Promise<ThematicExcerpt> {
  const db = getDb();
  const index = db.thematicExcerpts.findIndex((e) => e.id === excerpt.id);

  if (index >= 0) {
    db.thematicExcerpts[index] = excerpt;
  } else {
    excerpt.createdAt = new Date().toISOString();
    db.thematicExcerpts.push(excerpt);
  }

  createAuditLogSync("SAVE_THEMATIC_EXCERPT", "thematic_excerpt", excerpt.id, {
    articleId: excerpt.articleId,
    codeId: excerpt.codeId,
  }, userId, userEmail);

  saveDb(db);
  return excerpt;
}

export async function deleteThematicExcerpt(
  excerptId: string,
  userId?: string,
  userEmail?: string
): Promise<boolean> {
  const db = getDb();
  const countBefore = db.thematicExcerpts.length;
  db.thematicExcerpts = db.thematicExcerpts.filter((e) => e.id !== excerptId);

  if (db.thematicExcerpts.length !== countBefore) {
    createAuditLogSync("DELETE_THEMATIC_EXCERPT", "thematic_excerpt", excerptId, {}, userId, userEmail);
    saveDb(db);
    return true;
  }
  return false;
}

export async function getSynthesisSummary(projectId: string): Promise<SynthesisSummary> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  const projectArticles = db.articles.filter((a) => (a.projectId === id || a.projectId === projectId) && !a.isDuplicate);
  const records = db.extractedDataRecords.filter((r) => r.projectId === id || r.projectId === projectId);
  const codes = db.thematicCodes.filter((c) => c.projectId === id || c.projectId === projectId);
  const excerpts = db.thematicExcerpts.filter((e) => e.projectId === id || e.projectId === projectId);

  // Timeline
  const yearCounts: Record<number, number> = {};
  for (const art of projectArticles) {
    const yr = art.publicationYear || 2024;
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  }
  const timelineData = Object.entries(yearCounts)
    .map(([yr, count]) => ({ year: parseInt(yr, 10), count }))
    .sort((a, b) => a.year - b.year);

  // Country distribution from extracted records
  const countryCounts: Record<string, number> = {};
  for (const rec of records) {
    const country = rec.values.country || "Not Reported";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  }
  const countryDistribution = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // Study design distribution
  const designCounts: Record<string, number> = {};
  for (const rec of records) {
    const design = rec.values.study_design || "Parallel RCT";
    designCounts[design] = (designCounts[design] || 0) + 1;
  }
  const studyDesignDistribution = Object.entries(designCounts)
    .map(([design, count]) => ({ design, count }))
    .sort((a, b) => b.count - a.count);

  // Thematic matrix
  const thematicMatrix = codes.map((c) => {
    const codeExcerpts = excerpts.filter((e) => e.codeId === c.id);
    const uniqueArticleIds = Array.from(new Set(codeExcerpts.map((e) => e.articleId)));
    return {
      theme: c.name,
      articleIds: uniqueArticleIds,
      quoteCount: codeExcerpts.length,
    };
  });

  // Derived research gaps
  const researchGaps = [
    {
      topic: "Ketahanan Kontrol Glikemik Jangka Panjang (> 12 Bulan)",
      description: "Mayoritas uji klinis digital diabetes yang teridentifikasi memiliki batas masa intervensi maksimum 24-26 minggu. Bukti efektivitas jangka panjang melebihi 1 tahun masih sangat minim.",
      evidenceNote: "Hanya 0% dari artikel yang dianalisis meneliti durasi follow-up > 52 minggu.",
    },
    {
      topic: "Blinding & Bias Ekspektasi pada Intervensi Berbasis Aplikasi",
      description: "Hampir seluruh studi digital health merupakan open-label karena sifat intervensi perilaku menyulitkan penyamaran peserta (participant blinding). Diperlukan rancangan sham-app terkontrol.",
      evidenceNote: "Domain deviasi RoB 2 menandai kekhawatiran metodologis pada sebagian besar studi.",
    },
  ];

  return {
    timelineData,
    countryDistribution,
    studyDesignDistribution,
    thematicMatrix,
    researchGaps,
  };
}

// =====================================================================
// PUBLICATION, JOURNAL TABLES & MANUSCRIPT OPERATIONS
// =====================================================================

export async function getManuscriptByProjectId(
  projectId: string
): Promise<ProjectManuscript | undefined> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  return db.manuscripts.find((m) => m.projectId === id || m.projectId === projectId);
}

export async function saveManuscript(
  manuscript: ProjectManuscript,
  userId?: string,
  userEmail?: string
): Promise<ProjectManuscript> {
  const db = getDb();
  const index = db.manuscripts.findIndex((m) => m.id === manuscript.id || m.projectId === manuscript.projectId);
  manuscript.updatedAt = new Date().toISOString();

  if (index >= 0) {
    db.manuscripts[index] = manuscript;
  } else {
    manuscript.createdAt = new Date().toISOString();
    db.manuscripts.push(manuscript);
  }

  createAuditLogSync("SAVE_MANUSCRIPT", "project_manuscript", manuscript.id, {
    title: manuscript.title,
  }, userId, userEmail);

  saveDb(db);
  return manuscript;
}

export async function getTableDefinitions(
  projectId: string
): Promise<JournalTableDefinition[]> {
  const db = getDb();
  const id = resolveProjectId(projectId);
  return db.tableDefinitions.filter((t) => t.projectId === id || t.projectId === projectId);
}

export async function saveTableDefinition(
  tableDef: JournalTableDefinition,
  userId?: string,
  userEmail?: string
): Promise<JournalTableDefinition> {
  const db = getDb();
  const index = db.tableDefinitions.findIndex((t) => t.id === tableDef.id);
  tableDef.updatedAt = new Date().toISOString();

  if (index >= 0) {
    db.tableDefinitions[index] = tableDef;
  } else {
    tableDef.createdAt = new Date().toISOString();
    db.tableDefinitions.push(tableDef);
  }

  createAuditLogSync("SAVE_TABLE_DEFINITION", "journal_table_definition", tableDef.id, {
    title: tableDef.title,
    tableType: tableDef.tableType,
  }, userId, userEmail);

  saveDb(db);
  return tableDef;
}

// =====================================================================
// PAYMENT & TOP-UP OPERATIONS (QRIS & MIDTRANS)
// =====================================================================

export async function createPaymentOrderDb(order: PaymentOrder): Promise<PaymentOrder> {
  const db = getDb();
  if (!db.paymentOrders) db.paymentOrders = [];
  db.paymentOrders.push(order);
  createAuditLogSync("CREATE_PAYMENT_ORDER", "payment", order.id, {
    orderId: order.orderId,
    amount: order.amount,
    paymentType: order.paymentType,
  }, order.userId, order.userEmail);
  saveDb(db);
  return order;
}

export async function getPaymentOrderById(id: string): Promise<PaymentOrder | null> {
  const db = getDb();
  if (!db.paymentOrders) return null;
  const found = db.paymentOrders.find((o) => o.id === id || o.orderId === id);
  return found || null;
}

export async function updatePaymentOrderStatus(
  id: string,
  status: PaymentOrder["status"],
  metadata?: Record<string, any>
): Promise<PaymentOrder | null> {
  const db = getDb();
  if (!db.paymentOrders) return null;
  const order = db.paymentOrders.find((o) => o.id === id || o.orderId === id);
  if (!order) return null;

  order.status = status;
  if (status === "paid") {
    order.paidAt = new Date().toISOString();
  }
  if (metadata) {
    order.metadata = { ...(order.metadata || {}), ...metadata };
  }

  createAuditLogSync("UPDATE_PAYMENT_STATUS", "payment", order.id, {
    status,
    orderId: order.orderId,
  }, order.userId, order.userEmail);
  saveDb(db);
  return order;
}

export async function getUserPaymentOrders(userId: string): Promise<PaymentOrder[]> {
  await syncFromSupabase();
  const db = getDb();
  if (!db.paymentOrders) return [];
  return db.paymentOrders
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

