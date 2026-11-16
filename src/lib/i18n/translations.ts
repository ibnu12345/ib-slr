export type Language = "id" | "en";

export interface Translations {
  // Navigation
  nav_home: string;
  nav_features: string;
  nav_how_it_works: string;
  nav_researchers: string;
  nav_institutions: string;
  nav_pricing: string;
  nav_resources: string;
  nav_about: string;
  nav_contact: string;
  nav_login: string;
  nav_register: string;
  nav_workspace: string;
  nav_admin_cms: string;
  nav_logout: string;

  // Hero & Public
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_desc: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_trust_badge: string;

  // Pricing
  pricing_title: string;
  pricing_subtitle: string;
  pricing_free_title: string;
  pricing_free_tagline: string;
  pricing_pay_per_project_title: string;
  pricing_pay_per_project_tagline: string;
  pricing_pay_per_project_price: string;
  pricing_pay_per_project_period: string;
  pricing_pro_title: string;
  pricing_pro_tagline: string;
  pricing_inst_title: string;
  pricing_inst_tagline: string;
  pricing_cta_free: string;
  pricing_cta_pro: string;
  pricing_cta_addon: string;
  pricing_addon_callout_title: string;
  pricing_addon_callout_desc: string;
  pricing_per_month: string;
  pricing_per_project: string;

  // App Workspace & Projects
  app_welcome: string;
  app_admin_workspace: string;
  app_research_workspace: string;
  app_verified: string;
  app_unverified: string;
  app_verify_banner_title: string;
  app_verify_banner_desc: string;
  app_verify_btn: string;
  app_new_review: string;
  app_active_reviews: string;
  app_imported_refs: string;
  app_screening_progress: string;
  app_prisma_status: string;
  app_your_projects: string;
  app_isolated_notice: string;
  app_open_project: string;
  app_continue_screening: string;
  app_empty_title: string;
  app_empty_desc: string;
  app_create_first: string;

  // Project Tabs
  tab_overview: string;
  tab_protocol: string;
  tab_search: string;
  tab_import: string;
  tab_library: string;
  tab_deduplication: string;
  tab_screening_ta: string;
  tab_screening_ft: string;
  tab_conflicts: string;
  tab_extraction: string;
  tab_appraisal: string;
  tab_synthesis: string;
  tab_prisma: string;
  tab_publication: string;

  // Common
  lang_switch: string;
  lang_id: string;
  lang_en: string;
  btn_save: string;
  btn_cancel: string;
  btn_close: string;
  status_active: string;
  status_completed: string;
}

export const translations: Record<Language, Translations> = {
  id: {
    // Navigation
    nav_home: "Beranda",
    nav_features: "Fitur",
    nav_how_it_works: "Cara Kerja",
    nav_researchers: "Untuk Peneliti",
    nav_institutions: "Institusi & Lab",
    nav_pricing: "Biaya & Paket",
    nav_resources: "Panduan & Blog",
    nav_about: "Tentang Kami",
    nav_contact: "Hubungi Kami",
    nav_login: "Masuk",
    nav_register: "Daftar Gratis",
    nav_workspace: "Workspace Riset",
    nav_admin_cms: "Admin CMS",
    nav_logout: "Keluar",

    // Hero & Public
    hero_badge: "Standar Emas Systematic Literature Review",
    hero_title_1: "Dari Literatur Menjadi",
    hero_title_2: "Bukti Ilmiah Valid.",
    hero_desc: "Platform tinjauan pustaka sistematis (SLR) berbasis AI dengan kepatuhan PRISMA 2020 deterministik, penilaian bias RoB 2, dan sitasi berakar nyata tanpa halusinasi.",
    hero_cta_primary: "Mulai Tinjauan Pustaka",
    hero_cta_secondary: "Jelajahi Metodologi",
    hero_trust_badge: "Dipercaya akademisi dan peneliti di bidang kesehatan, teknologi, dan ilmu sosial.",

    // Pricing
    pricing_title: "Biaya Transparan & Ramah Akademisi",
    pricing_subtitle: "Mulai dari proyek gratis untuk mahasiswa hingga tata kelola skala institusi berpendanaan riset.",
    pricing_free_title: "Academic Free",
    pricing_free_tagline: "Pondasi riset SLR esensial untuk mahasiswa dan peneliti mandiri.",
    pricing_pay_per_project_title: "Pay-Per-Project Pass",
    pricing_pay_per_project_tagline: "Beli kuota tambahan 1x proyek aktif tanpa perlu langganan bulanan.",
    pricing_pay_per_project_price: "Rp 10.000",
    pricing_pay_per_project_period: "/ 1x proyek",
    pricing_pro_title: "Professional Researcher",
    pricing_pro_tagline: "Ekstraksi AI berbasis sitasi dan alur kerja dual-reviewer untuk peneliti.",
    pricing_inst_title: "Institutional & Lab",
    pricing_inst_tagline: "Tata kelola departemen, kepatuhan HIPAA/FERPA, dan penyimpanan aman.",
    pricing_cta_free: "Mulai Gratis Sekarang",
    pricing_cta_pro: "Pilih Professional",
    pricing_cta_addon: "Beli 1X Proyek Tambahan (Rp 10k)",
    pricing_addon_callout_title: "Fleksibel: Tambah Proyek Rp 10.000 / 1X Proyek Aktif",
    pricing_addon_callout_desc: "Sudah memakai kuota 1 proyek gratis dan ingin mengerjakan proyek kedua? Tidak perlu langganan bulanan mahal — cukup top-up 1X Active Systematic Review Project seharga Rp 10.000!",
    pricing_per_month: "/ bulan",
    pricing_per_project: "/ 1x proyek aktif",

    // App Workspace & Projects
    app_welcome: "Selamat Datang",
    app_admin_workspace: "Workspace Administrator",
    app_research_workspace: "Workspace Riset",
    app_verified: "Terverifikasi",
    app_unverified: "Belum Verifikasi",
    app_verify_banner_title: "Verifikasi Email Diperlukan",
    app_verify_banner_desc: "Konfirmasi email Anda untuk membuka fitur unggah PDF, integrasi AI, dan ekspor manuskrip secara penuh.",
    app_verify_btn: "Verifikasi Email",
    app_new_review: "Tinjauan Pustaka Baru",
    app_active_reviews: "Proyek SLR Aktif",
    app_imported_refs: "Referensi Terimpor",
    app_screening_progress: "Progres Screening",
    app_prisma_status: "Rekonsiliasi PRISMA",
    app_your_projects: "Daftar Proyek Systematic Review Anda",
    app_isolated_notice: "Workspace penelitian terisolasi dengan perlindungan Row-Level Security",
    app_open_project: "Buka Proyek",
    app_continue_screening: "Lanjut Screening",
    app_empty_title: "Belum Ada Proyek Riset",
    app_empty_desc: "Mulai proyek SLR baru Anda dengan menyusun protokol PICO atau PICo.",
    app_create_first: "Buat Proyek Pertama",

    // Project Tabs
    tab_overview: "Ringkasan",
    tab_protocol: "Protokol PICO",
    tab_search: "Strategi Pencarian",
    tab_import: "Pusat Impor",
    tab_library: "Perpustakaan Referensi",
    tab_deduplication: "Deduplikasi",
    tab_screening_ta: "Screening Judul/Abstrak",
    tab_screening_ft: "Screening Teks Lengkap",
    tab_conflicts: "Adjudikasi Konflik",
    tab_extraction: "Ekstraksi Data",
    tab_appraisal: "Penilaian RoB 2",
    tab_synthesis: "Sintesis Bukti",
    tab_prisma: "Diagram PRISMA 2020",
    tab_publication: "Studio Publikasi & Tabel",

    // Common
    lang_switch: "Pilih Bahasa",
    lang_id: "Bahasa Indonesia",
    lang_en: "English",
    btn_save: "Simpan",
    btn_cancel: "Batal",
    btn_close: "Tutup",
    status_active: "AKTIF",
    status_completed: "SELESAI",
  },
  en: {
    // Navigation
    nav_home: "Home",
    nav_features: "Features",
    nav_how_it_works: "How It Works",
    nav_researchers: "For Researchers",
    nav_institutions: "Institutions & Labs",
    nav_pricing: "Pricing",
    nav_resources: "Resources & Blog",
    nav_about: "About",
    nav_contact: "Contact",
    nav_login: "Log In",
    nav_register: "Get Started Free",
    nav_workspace: "Research Workspace",
    nav_admin_cms: "Admin CMS",
    nav_logout: "Log Out",

    // Hero & Public
    hero_badge: "The Gold Standard for Systematic Literature Reviews",
    hero_title_1: "From Literature to",
    hero_title_2: "Verifiable Evidence.",
    hero_desc: "The AI-assisted systematic review platform with deterministic PRISMA 2020 reconciliation, Cochrane RoB 2 risk-of-bias auditing, and citation-anchored extraction without hallucination.",
    hero_cta_primary: "Start Systematic Review",
    hero_cta_secondary: "Explore Methodology",
    hero_trust_badge: "Trusted by biomedical, engineering, and social science scholars worldwide.",

    // Pricing
    pricing_title: "Transparent, Academic-Friendly Pricing",
    pricing_subtitle: "From a free tier for individual scholars to department-wide governance for funded institutions.",
    pricing_free_title: "Academic Free",
    pricing_free_tagline: "Essential SLR tooling for solo students and independent scholars.",
    pricing_pay_per_project_title: "Pay-Per-Project Pass",
    pricing_pay_per_project_tagline: "Add +1 active systematic review project without a monthly subscription.",
    pricing_pay_per_project_price: "Rp 10,000 ($0.65)",
    pricing_pay_per_project_period: "/ 1x project",
    pricing_pro_title: "Professional Researcher",
    pricing_pro_tagline: "Citation-grounded AI extraction and dual-reviewer blinding for funded researchers.",
    pricing_inst_title: "Institutional & Lab",
    pricing_inst_tagline: "Department governance, HIPAA/FERPA tenancy, and secure storage connectors.",
    pricing_cta_free: "Get Started Free",
    pricing_cta_pro: "Choose Professional",
    pricing_cta_addon: "Get 1X Extra Project (Rp 10k)",
    pricing_addon_callout_title: "Pay-As-You-Go: Rp 10,000 (~$0.65) per 1X Active Project",
    pricing_addon_callout_desc: "Already using your 1 free active project and want to run a second one? No expensive monthly commitment needed — simply unlock +1 Active Systematic Review Project for just Rp 10,000!",
    pricing_per_month: "/ month",
    pricing_per_project: "/ 1x active project",

    // App Workspace & Projects
    app_welcome: "Welcome",
    app_admin_workspace: "Administrator Workspace",
    app_research_workspace: "Research Workspace",
    app_verified: "Verified",
    app_unverified: "Unverified",
    app_verify_banner_title: "Email Verification Required",
    app_verify_banner_desc: "Please verify your email address to unlock PDF uploads, citation AI tools, and manuscript exports.",
    app_verify_btn: "Verify Email",
    app_new_review: "New Systematic Review",
    app_active_reviews: "Active SLR Projects",
    app_imported_refs: "Imported References",
    app_screening_progress: "Screening Progress",
    app_prisma_status: "PRISMA Reconciliation",
    app_your_projects: "Your Systematic Review Projects",
    app_isolated_notice: "Isolated research workspaces governed by Row-Level Security",
    app_open_project: "Open Project",
    app_continue_screening: "Continue Screening",
    app_empty_title: "No Research Projects Yet",
    app_empty_desc: "Start your new systematic review by configuring your PICO or PICo protocol.",
    app_create_first: "Create First Project",

    // Project Tabs
    tab_overview: "Overview",
    tab_protocol: "PICO Protocol",
    tab_search: "Search Strategy",
    tab_import: "Import Center",
    tab_library: "Reference Library",
    tab_deduplication: "Deduplication",
    tab_screening_ta: "Title/Abstract Screening",
    tab_screening_ft: "Full-Text Screening",
    tab_conflicts: "Conflict Adjudication",
    tab_extraction: "Data Extraction",
    tab_appraisal: "RoB 2 Appraisal",
    tab_synthesis: "Evidence Synthesis",
    tab_prisma: "PRISMA 2020 Flow",
    tab_publication: "Publication Studio & Tables",

    // Common
    lang_switch: "Language",
    lang_id: "Bahasa Indonesia",
    lang_en: "English",
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_close: "Close",
    status_active: "ACTIVE",
    status_completed: "COMPLETED",
  },
};
