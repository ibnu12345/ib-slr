export function translateNavLabel(label: string, url: string, isId: boolean): string {
  if (!isId) return label;
  const l = label.toLowerCase().trim();
  if (url === "/" || l === "home" || l === "beranda") return "Beranda";
  if (url === "/features" || l.includes("feature")) return "Fitur";
  if (url === "/how-it-works" || l.includes("how it works")) return "Cara Kerja";
  if (url === "/for-researchers" || l.includes("researcher")) return "Untuk Peneliti";
  if (url === "/for-institutions" || l.includes("institution")) return "Institusi & Lab";
  if (url === "/pricing" || l.includes("pricing")) return "Biaya & Paket";
  if (url === "/blog" || l.includes("blog")) return "Blog Riset";
  if (url === "/resources" || l.includes("resource")) return "Panduan & Checklist";
  if (url === "/about" || l.includes("about")) return "Tentang Kami";
  if (url === "/contact" || l.includes("contact")) return "Hubungi Kami";
  if (url === "/privacy" || l.includes("privacy")) return "Kebijakan Privasi";
  if (url === "/terms" || l.includes("terms")) return "Syarat & Ketentuan";
  if (url === "/security" || l.includes("security")) return "Keamanan";
  return label;
}

export function translateFooterLabel(label: string, url: string, isId: boolean): string {
  return translateNavLabel(label, url, isId);
}

export const heroTranslations = {
  id: {
    badge: "Standar Emas Systematic Literature Review (SLR)",
    title: "Dari Literatur Menjadi Bukti Ilmiah Valid.",
    subtitle: "Ruang kerja tinjauan pustaka sistematis (SLR) berbasis AI yang dirancang untuk integritas akademik. Kelola protokol, screening literatur dengan penyamaran dual-reviewer, dan hasilkan laporan PRISMA 2020 siap audit.",
    primaryCta: "Mulai Tinjauan Pustaka",
    secondaryCta: "Pelajari Metodologi",
    trustPrisma: "Penghitungan PRISMA 2020 deterministik",
    trustQuote: "Kutipan sitasi & nomor halaman nyata",
    trustRls: "Privasi terisolasi dengan Row-Level Security",
  },
  en: {
    badge: "AI-Assisted Systematic Review Workspace",
    title: "From Literature to Evidence.",
    subtitle: "A rigorous, AI-assisted systematic review workspace engineered for researchers. Manage protocols, screen literature with dual-reviewer blinding, and generate audit-proof PRISMA 2020 reports.",
    primaryCta: "Start Systematic Review",
    secondaryCta: "Explore Methodology",
    trustPrisma: "Deterministic PRISMA 2020 counts",
    trustQuote: "Verbatim quote & page citations",
    trustRls: "Private by default with RLS",
  },
};

export const featureGridTranslations = {
  id: {
    title: "Dirancang untuk Ketelitian & Integritas Ilmiah",
    subtitle: "Setiap modul menegakkan standar akademik tertinggi, transparansi audit, dan kepatuhan PRISMA 2020.",
    features: [
      {
        title: "Penyusun Protokol & Pertanyaan Riset",
        description: "Dukungan penuh framework PICO, PICo, SPIDER, dan perumusan kriteria kelayakan inklusi/eksklusi sebelum pencarian dimulai.",
      },
      {
        title: "Pusat Impor & Deduplikasi Cerdas",
        description: "Unggah file RIS, BibTeX, EndNote XML, atau CSV dengan pelacakan asal database dan deteksi duplikasi berbasis DOI otomatis.",
      },
      {
        title: "Screening Tersamar Dual-Reviewer",
        description: "Penilaian independen tanpa bias dengan penyamaran reviewer, pencatatan alasan eksklusi terstruktur, dan ruang adjudikasi konflik.",
      },
      {
        title: "Diagram Alir PRISMA 2020 Deterministik",
        description: "Angka PRISMA dihasilkan langsung dari rekaman buku besar aktivitas nyata tanpa perkiraan atau rekayasa angka.",
      },
      {
        title: "Asisten AI Berbasis Sitasi (Zero Hallucination)",
        description: "Rekomendasi AI selalu disertai kutipan bukti kalimat asli dan nomor halaman dokumen, diekstraksi ke matriks terverifikasi.",
      },
      {
        title: "Penilaian Kualitas Metodologis & RoB 2",
        description: "Framework penilaian Cochrane RoB 2, CASP Kualitatif, dan JBI dengan grafik visual traffic-light plot siap publikasi jurnal.",
      },
    ],
  },
  en: {
    title: "Built for Methodological Rigor",
    subtitle: "Every module enforces academic standards, auditability, and data integrity.",
    features: [
      {
        title: "Protocol & Question Builder",
        description: "PICO, PICo, SPIDER, and configurable eligibility criteria frameworks with locked versioning before search execution.",
      },
      {
        title: "Import & Deduplication Center",
        description: "Direct ingest of RIS, BibTeX, EndNote XML, and CSV with source provenance and deterministic duplicate detection.",
      },
      {
        title: "Dual-Reviewer Blinding",
        description: "Independent title/abstract and full-text screening with strict blinding, exclusion taxonomy, and conflict adjudication.",
      },
      {
        title: "Deterministic PRISMA 2020",
        description: "Flow diagram driven by an immutable event ledger. Zero fabricated counts, fully reconcilable back to imported records.",
      },
      {
        title: "Citation-Anchored AI Assistant",
        description: "Every AI screening rationale and extracted data field references verifiable article identifiers, page numbers, and verbatim quotes.",
      },
      {
        title: "Quality Appraisal & RoB 2",
        description: "Domain-by-domain Cochrane RoB 2, CASP, and JBI appraisal instruments with consensus resolution and traffic-light plots.",
      },
    ],
  },
};

export const workflowTranslations = {
  id: {
    title: "Alur Kerja Tinjauan Pustaka Sistematis",
    subtitle: "Tahapan ilmiah terstruktur dan dapat direplikasi dari penyusunan protokol hingga manuskrip siap publikasi.",
    steps: [
      {
        stepNumber: "01 PROTOKOL",
        title: "Penyusunan Protokol & PICO",
        description: "Rumuskan pertanyaan riset, framework PICO/PICo, dan kriteria inklusi/eksklusi sebelum pencarian dimulai.",
      },
      {
        stepNumber: "02 PENCARIAN & IMPOR",
        title: "Impor Sumber Literatur",
        description: "Tarik referensi dari PubMed, Scopus, IEEE, atau file RIS/BibTeX dengan pencatatan tanggal dan query pencarian.",
      },
      {
        stepNumber: "03 DEDUPLIKASI",
        title: "Pembersihan Duplikasi",
        description: "Deteksi otomatis kecocokan DOI dan kesamaan judul dengan skor kemiripan sebelum tahap screening.",
      },
      {
        stepNumber: "04 SCREENING TERSAMAR",
        title: "Screening Judul & Teks Lengkap",
        description: "Tinjau literatur bersama rekan peneliti secara independen dengan alasan eksklusi terstruktur dan adjudikasi konflik.",
      },
      {
        stepNumber: "05 SINTESIS & LAPORAN",
        title: "Ekstraksi & Publikasi",
        description: "Ekstraksi data dengan verifikasi manusia, penilaian risiko bias RoB 2, dan ekspor diagram PRISMA 2020 instan.",
      },
    ],
  },
  en: {
    title: "The Systematic Review Workflow",
    subtitle: "A structured, reproducible progression from initial protocol to published manuscript.",
    steps: [
      {
        stepNumber: "01 PROTOCOL",
        title: "Protocol & Question Builder",
        description: "Define PICO framework, research questions, and explicit eligibility criteria before search execution.",
      },
      {
        stepNumber: "02 SEARCH & INGEST",
        title: "Search Strategy & Import",
        description: "Import RIS, BibTeX, and CSV files from PubMed, Scopus, and IEEE with complete query provenance.",
      },
      {
        stepNumber: "03 DEDUPLICATION",
        title: "Deterministic Deduplication",
        description: "Automated candidate pairing with DOI normalization, title distance matching, and auditable merge history.",
      },
      {
        stepNumber: "04 SCREENING",
        title: "Dual-Reviewer Screening",
        description: "Blind review for title/abstract and full-text stages with standardized exclusion reasons and consensus adjudication.",
      },
      {
        stepNumber: "05 REPORTING",
        title: "Extraction & PRISMA Reporting",
        description: "Citation-grounded extraction, Cochrane RoB 2 appraisal, journal-ready summary tables, and PRISMA 2020 diagrams.",
      },
    ],
  },
};

export const ctaTranslations = {
  id: {
    title: "Tingkatkan Kualitas Riset Systematic Review Anda",
    subtitle: "Bergabunglah dengan ribuan akademisi yang menyusun tinjauan pustaka transparan, presisi, dan sesuai standar PRISMA 2020.",
    primaryCta: "Mulai Proyek Gratis",
    secondaryCta: "Hubungi Tim Riset",
  },
  en: {
    title: "Advance Your Literature Review Today",
    subtitle: "Join researchers worldwide in building transparent, reproducible systematic reviews with IB-SLR.",
    primaryCta: "Start Free Workspace",
    secondaryCta: "Contact Research Team",
  },
};

export const faqTranslations = {
  id: {
    badge: "Metodologi & Pertanyaan",
    title: "Pertanyaan yang Sering Diajukan",
    subtitle: "Pelajari bagaimana IB-SLR menjamin kepatuhan metodologis, privasi data, dan keandalan pelaporan PRISMA 2020.",
    items: [
      {
        id: "faq-1",
        question: "Bagaimana IB-SLR menjamin kepatuhan terhadap standar PRISMA 2020?",
        answer: "Angka PRISMA di IB-SLR tidak pernah diperkirakan atau direkayasa. Platform menerapkan Buku Besar Aktivitas PRISMA (Event Ledger) yang mencatat setiap literatur yang diimpor, penghapusan duplikasi, alasan eksklusi judul/abstrak, dan penilaian teks lengkap secara real-time dan dapat diaudit.",
      },
      {
        id: "faq-2",
        question: "Bagaimana cara kerja penyamaran dual-reviewer (blinding)?",
        answer: "Saat penyamaran aktif, keputusan dan catatan dari reviewer A tidak dapat dilihat oleh reviewer B hingga kedua reviewer selesai menilai. Jika terjadi perbedaan keputusan inklusi vs eksklusi, sistem menandai artikel tersebut sebagai 'conflict' untuk diadjudikasi oleh ketua tim.",
      },
      {
        id: "faq-3",
        question: "Apakah asisten AI dapat membuat kutipan palsu (halusinasi)?",
        answer: "Tidak. Kebijakan AI di IB-SLR mengharuskan bukti sitasi berakar nyata. Setiap rekomendasi ekstraksi atau screening wajib menyertakan kutipan kalimat verbatim asli dan nomor halaman dari artikel. Jika data tidak ditemukan di dokumen, AI melaporkan 'tidak ditemukan' daripada menebak.",
      },
      {
        id: "faq-4",
        question: "Format file apa saja yang didukung untuk impor referensi?",
        answer: "IB-SLR mendukung impor standar RIS (dari EndNote, Zotero, Mendeley), BibTeX (.bib), EndNote XML, dan spreadsheet CSV yang diekspor dari database PubMed, Scopus, Web of Science, dan IEEE Xplore.",
      },
      {
        id: "faq-5",
        question: "Bagaimana cara menggunakan opsi Pay-Per-Project Pass (Rp 20.000)?",
        answer: "Setiap pengguna baru langsung mendapatkan 1 proyek aktif gratis permanen. Jika Anda ingin menambah proyek kedua tanpa beralih ke paket langganan bulanan, Anda cukup membeli 1X Active Review Pass seharga Rp 20.000 per proyek.",
      },
    ],
  },
  en: {
    badge: "Methodology & Questions",
    title: "Frequently Asked Questions",
    subtitle: "Learn how IB-SLR ensures methodological compliance, data isolation, and PRISMA 2020 accuracy.",
    items: [
      {
        id: "faq-1",
        question: "How does IB-SLR ensure PRISMA 2020 compliance?",
        answer: "PRISMA numbers in IB-SLR are never estimated or hallucinated. The platform implements an immutable PRISMA Event Ledger that records every imported record, duplicate removal, title/abstract exclusion (with structured reason codes), and full-text assessment in real time.",
      },
      {
        id: "faq-2",
        question: "How does dual-reviewer blinding work?",
        answer: "When blinding is enabled for a screening stage, reviewer decisions and notes remain hidden from peer reviewers until both parties submit their independent evaluations. Discrepancies automatically generate conflict records for adjudication.",
      },
      {
        id: "faq-3",
        question: "Can AI screening or extraction fabricate citations?",
        answer: "No. The AI evidence policy requires grounding in the uploaded document text. Every suggestion must point to an article identifier, specific section, and exact supporting excerpt. If information is absent, the model returns 'not reported'.",
      },
      {
        id: "faq-4",
        question: "What reference formats can be imported into IB-SLR?",
        answer: "IB-SLR supports standard RIS files (exported from EndNote, Zotero, Mendeley, Covidence), BibTeX (.bib) collections, EndNote XML, and CSV bibliographies exported from PubMed, Scopus, Web of Science, and Crossref.",
      },
      {
        id: "faq-5",
        question: "How does the Pay-Per-Project Pass (Rp 20,000) work?",
        answer: "Every user receives 1 active review project free forever. If you wish to conduct an additional review without committing to a monthly subscription, you can unlock an extra active project pass for just Rp 20,000 (~$1.30) per project.",
      },
    ],
  },
};
