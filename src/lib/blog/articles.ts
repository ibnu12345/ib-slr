export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: "PRISMA 2020" | "Metodologi Riset" | "Strategi Pencarian" | "Penilaian Kritis" | "AI & Etika Riset" | "Publikasi Ilmiah";
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  tags: string[];
  content: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "panduan-lengkap-systematic-literature-review-prisma-2020",
    title: "Panduan Lengkap Menyusun Systematic Literature Review (SLR) Menggunakan Standar PRISMA 2020",
    excerpt: "Panduan komprehensif langkah-demi-langkah melakukan tinjauan pustaka sistematis mulai dari formulasi protokol PICO, pencarian multi-database, deduplikasi, hingga pelaporan diagram alir PRISMA 2020.",
    category: "PRISMA 2020",
    readTime: "12 min read",
    publishedAt: "2026-11-20",
    updatedAt: "2026-11-22",
    author: {
      name: "Tim Editorial Metodologi IB-SLR",
      role: "Evidence Synthesis Specialists & Research Mentors",
    },
    tags: ["Systematic Review", "PRISMA 2020", "PICO", "Metodologi Riset", "Scopus"],
    content: `
## 1. Pengantar: Mengapa PRISMA 2020 Sangat Penting?

Tinjauan Pustaka Sistematis (*Systematic Literature Review* / SLR) adalah metodologi riset tingkat tertinggi dalam hierarki bukti ilmiah (*evidence hierarchy*). Berbeda dengan *narrative literature review* konvensional yang cenderung subjektif dan rentan terhadap bias pemilihan literatur, SLR mengikuti protokol yang ketat, transparan, dan dapat direproduksi (*replicable*) oleh peneliti lain di masa depan.

Pada tahun 2020, pedoman pelaporan internasional **PRISMA (*Preferred Reporting Items for Systematic Reviews and Meta-Analyses*)** diperbarui menjadi **PRISMA 2020 Statement** guna mencerminkan kemajuan metode pencarian basis data, teknik sintesis bukti, serta transparansi pelaporan. Jurnal-jurnal terindeks Scopus (Q1/Q2) dan Web of Science (WoS) kini secara ketat mensyaratkan penulis menyertakan **Diagram Alir PRISMA 2020 (PRISMA Flow Diagram)** dan **Checklist 27 butir PRISMA**.

---

## 2. Sepuluh Tahap Baku Pelaksanaan SLR

Berdasarkan *Cochrane Handbook for Systematic Reviews* dan pedoman PRISMA 2020, pelaksanaan SLR yang auditabel mencakup 10 tahap berurutan:

1. **Formulasi Pertanyaan Penelitian & Protokol (PICO / SPIDER)**
2. **Penyusunan Strategi Pencarian Kata Kunci (*Search Strategy*)**
3. **Pencarian Komprehensif di Multi-Database (PubMed, Scopus, IEEE, WoS)**
4. **Pengumpulan & Deduplikasi Referensi (*Deduplication*)**
5. **Penyaringan Tahap 1: Judul dan Abstrak (*Title & Abstract Screening*)**
6. **Penyaringan Tahap 2: Teks Lengkap (*Full-Text Eligibility Screening*)**
7. **Penilaian Kualitas Metodologis & Risiko Bias (*Critical Appraisal / RoB*)**
8. **Ekstraksi Data Terstruktur (*Data Extraction Matrix*)**
9. **Sintesis Temuan (Sintesis Kualitatif / Meta-Analisis Kuantitatif)**
10. **Penyusunan Laporan Akhir & Diagram PRISMA 2020**

---

## 3. Merumuskan Kerangka Protokol PICO

Sebelum memulai pencarian, pertanyaan riset harus dibedah ke dalam komponen terstruktur. Kerangka yang paling umum digunakan adalah **PICO**:

| Komponen | Penjelasan | Contoh Riset Kedokteran / Informatika Kesehatan |
| :--- | :--- | :--- |
| **P (Population / Problem)** | Populasi pasien, subjek, atau domain masalah spesifik. | Pasien rawat inap dewasa dengan penyakit kardiovaskular. |
| **I (Intervention)** | Terapi, intervensi medis, sistem perangkat lunak, atau metode yang diuji. | Sistem peringatan dini berbasis Artificial Intelligence (Clinical AI). |
| **C (Comparison)** | Pembanding standar, kontrol plasebo, atau metode konvensional. | Monitoring klinis manual tanpa integrasi algoritma AI. |
| **O (Outcome)** | Luaran terukur yang dievaluasi (primer & sekunder). | Angka mortalitas 30 hari, durasi rawat ICU, waktu respon perawat. |

Untuk penelitian ilmu sosial, manajemen, atau kualitatif murni, peneliti dapat mengadaptasi kerangka alternatif seperti **SPIDER** (*Sample, Phenomenon of Interest, Design, Evaluation, Research type*).

---

## 4. Pelacakan Basis Data & Pencarian Boolean

Pencarian literatur wajib dilakukan minimal pada **2 hingga 3 basis data ilmiah terakreditasi internasional**. Kombinasikan operator Boolean (**AND**, **OR**, **NOT**) serta pemotongan kata (*wildcards* \`*\`):

\`\`\`text
("artificial intelligence" OR "machine learning" OR "deep learning") 
AND ("cardiovascular disease" OR "myocardial infarction" OR "heart failure") 
AND ("early warning score" OR "clinical prediction" OR "mortality risk")
\`\`\`

> **Catatan Penting:** Catat tanggal persis penarikan data (*exact date of search*), string kueri yang digunakan, serta total artikel yang diperoleh dari masing-masing database untuk dicantumkan dalam tabel metodologi manuskrip Anda.

---

## 5. Deduplikasi Artikel Ilmiah

Ketika Anda mengekspor file referensi (RIS/BibTeX) dari PubMed (misal 1.200 artikel) dan Scopus (misal 950 artikel), dipastikan ada ratusan artikel yang tumpang tindih (*duplicates*). 

Deduplikasi harus dilakukan secara sistematis:
- **Pencocokan Pasti (*Exact Match*):** Berdasarkan nomor Digital Object Identifier (DOI) yang identik.
- **Pencocokan Judul & Penulis (*Fuzzy Matching*):** Normalisasi tanda baca, huruf besar/kecil, dan nama penulis utama untuk menangkap artikel yang belum mencantumkan DOI.

Di platform **IB-SLR**, algoritma deduplikasi otomatis mengelompokkan kandidat duplikat dan menghitung rasio kesamaan judul, sehingga peneliti dapat memverifikasi dengan satu klik tanpa risiko salah hapus.

---

## 6. Diagram Alir PRISMA 2020: 4 Fase Utama

Diagram alir PRISMA 2020 memvisualisasikan perjalanan artikel melalui empat fase:

\`\`\`
[1. IDENTIFICATION]
  -> Catatan teridentifikasi dari Database (n = ...)
  -> Catatan duplikat yang dihapus (n = ...)
        |
        v
[2. SCREENING]
  -> Catatan yang disaring Judul & Abstrak (n = ...)
  -> Catatan yang dieksklusi Judul & Abstrak (n = ...)
        |
        v
[3. ELIGIBILITY]
  -> Laporan teks lengkap yang dinilai kelayakannya (n = ...)
  -> Laporan teks lengkap yang dieksklusi disertai ALASAN (n = ...)
        |
        v
[4. INCLUDED]
  -> Studi baru yang disertakan dalam tinjauan (n = ...)
\`\`\`

> **Ketentuan Kritis PRISMA 2020:** Setiap artikel yang dieksklusi pada tahap teks lengkap (**Eligibility**) **WAJIB** memiliki alasan eksklusi yang spesifik dan terukur (contoh: *Wrong population*, *Ineligible intervention*, *No quantitative outcome data*, *Full-text unavailable*).

---

## 7. Kesimpulan & Rekomendasi Praktis

Menjalankan Systematic Literature Review bukan sekadar mengumpulkan artikel, melainkan menjalankan protokol ilmiah yang dapat diaudit secara transparan. Dengan mengadopsi standar PRISMA 2020, naskah riset Anda memiliki kredibilitas metodologis yang tinggi dan siap bersaing di jurnal ilmiah internasional bereputasi.
`,
  },
  {
    slug: "cara-membuat-strategi-pencarian-boolean-pubmed-scopus-ieee",
    title: "Merancang Strategi Pencarian Boolean Query yang Komprehensif di Database PubMed, Scopus, dan IEEE Xplore",
    excerpt: "Pelajari cara menyusun sintaks pencarian lanjutan menggunakan operator Boolean, MeSH terms, field tags [tiab], serta wildcards untuk meminimalkan bias seleksi artikel ilmiah.",
    category: "Strategi Pencarian",
    readTime: "10 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-22",
    author: {
      name: "dr. Ibnu Setiawan",
      role: "Lead Medical Informatics Researcher",
    },
    tags: ["Boolean Search", "PubMed", "Scopus", "MeSH Terms", "IEEE Xplore"],
    content: `
## 1. Mengapa Strategi Pencarian Menentukan Nasib SLR Anda?

Sebagus apa pun analisis dan sintesis data yang Anda lakukan, tinjauan pustaka Anda akan bias jika fondasi pencariannya (*search strategy*) cacat sejak awal. Fenomena ini dikenal dalam metodologi ilmiah sebagai **Selection Bias**—yakni ketika artikel-artikel kunci terlewatkan hanya karena variasi istilah sinonim tidak disertakan dalam kata kunci pencarian.

Untuk menghasilkan tinjauan sistematis berbobot tinggi, peneliti harus menguasai sintaks pencarian lanjutan (*Advanced Search Syntax*) yang disesuaikan dengan karakteristik masing-masing database.

---

## 2. Anatomi Operator Boolean & Simbol Khusus

| Operator / Karakter | Fungsi Metodologis | Contoh Penggunaan |
| :--- | :--- | :--- |
| **OR** | Menghubungkan sinonim, akronim, dan variasi ejaan. Memperluas hasil (*broadening*). | \`"machine learning" OR "deep learning" OR "neural network"\` |
| **AND** | Menggabungkan antar-konsep PICO yang berbeda. Mempersempit hasil (*narrowing*). | \`Concept_A AND Concept_B AND Concept_C\` |
| **NOT / AND NOT** | Mengecualikan domain tertentu (gunakan dengan sangat hati-hati). | \`AND NOT ("animal study" OR "rat" OR "mice")\` |
| **Tanda Petik (" ")** | *Phrase searching*—mencari urutan frasa persis tanpa terpisah kata. | \`"systematic literature review"\` |
| **Asterisk (*)** | *Truncation/Wildcard*—mencari berbagai akhiran kata dasar. | \`comput* (mencakup computer, computing, computational)\` |

---

## 3. Implementasi Kueri pada Basis Data Utama

### A. PubMed (National Library of Medicine)
PubMed menggunakan sistem indeks taksonomi medis yang sangat kuat bernama **Medical Subject Headings (MeSH)**:

\`\`\`text
("Artificial Intelligence"[Mesh] OR "Machine Learning"[Mesh] OR "Deep Learning"[Mesh] OR "artificial intelligence"[tiab] OR "deep learning"[tiab]) 
AND 
("Cardiovascular Diseases"[Mesh] OR "cardiovascular"[tiab] OR "heart failure"[tiab]) 
AND 
("Risk Assessment"[Mesh] OR "early warning"[tiab] OR "mortality prediction"[tiab])
\`\`\`

> **Tips:** Gunakan tag \`[tiab]\` (*Title/Abstract*) agar PubMed hanya mencari kata kunci di judul dan abstrak, bukan di catatan kaki atau nama afiliasi penulis.

### B. Scopus (Elsevier)
Scopus memiliki sintaks khusus dengan tag field \`TITLE-ABS-KEY\`:

\`\`\`text
TITLE-ABS-KEY ( ( "artificial intelligence" OR "deep learning" OR "machine learning" ) 
AND ( "cardiovascular" OR "heart disease" OR "myocardial infarction" ) 
AND ( "prediction" OR "early detection" OR "prognosis" ) )
\`\`\`

### C. IEEE Xplore
IEEE Xplore sangat sensitif terhadap batas nesting tanda kurung. Gunakan mode *Command Search*:

\`\`\`text
(("Document Title":"machine learning" OR "Abstract":"machine learning") 
AND ("Document Title":"healthcare" OR "Abstract":"healthcare"))
\`\`\`

---

## 4. Evaluasi Kejenuhan Hasil Pencarian (Search Calibration)

Lakukan kalibrasi awal sebelum melakukan pencarian final:
1. **Tes Artikel Kontrol (*Sentinel Papers*):** Buat daftar 5–10 artikel penting yang sudah Anda ketahui pasti relevan. Jalankan kueri Anda di database. Jika ada artikel kontrol yang tidak muncul, periksa kata kunci apa yang membuatnya terlewat dan tambahkan sinonim tersebut ke dalam kueri.
2. **Dokumentasikan Log Pencarian:** Catat waktu, tanggal, limit tahun publikasi (misal: 2018–2026), filter bahasa, dan jumlah *records identified*.
`,
  },
  {
    slug: "uji-reliabilitas-reviewer-cohens-kappa-systematic-review",
    title: "Uji Reliabilitas Antar-Penilai: Menghitung dan Menginterpretasikan Cohen's Kappa dalam Skrining Artikel Ilmiah",
    excerpt: "Memahami pentingnya dual-reviewer blinding, matriks kontingensi 2x2, rumus Cohen's Kappa, serta resolusi konflik telaah untuk menjamin objektivitas seleksi literatur.",
    category: "Metodologi Riset",
    readTime: "9 min read",
    publishedAt: "2026-11-15",
    updatedAt: "2026-11-22",
    author: {
      name: "Tim Editorial Metodologi IB-SLR",
      role: "Statistical Review Board",
    },
    tags: ["Cohen's Kappa", "Dual Reviewer", "Inter-Rater Reliability", "Screening Bias"],
    content: `
## 1. Mengapa Skrining Harus Melibatkan Minimal Dua Penilai?

Salah satu kriteria mutlak yang membedakan tinjauan sistematis berkualitas tinggi dari tinjauan abal-abal adalah diterapkannya **Dual-Reviewer Blinding** (Penyaringan oleh minimal dua penilai independen). Jika seleksi artikel hanya dilakukan oleh satu orang peneliti, risiko bias kognitif pribadi (*confirmation bias*) sangat tinggi.

Dalam panduan Cochrane, dua reviewer harus menilai setiap artikel secara terpisah tanpa saling mengetahui keputusan satu sama lain (*blinded screening*). Tingkat kesepakatan (*agreement*) antara kedua penilai tersebut diukur secara statistik menggunakan koefisien **Cohen's Kappa (κ)**.

---

## 2. Rumus Matematis Cohen's Kappa

Koefisien Kappa mengukur kesepakatan aktual antara dua penilai dengan memperhitungkan faktor peluang keberuntungan (*chance agreement*):

$$\\kappa = \\frac{P_o - P_e}{1 - P_e}$$

Di mana:
- **$P_o$ (Observed Proportion):** Proporsi kesepakatan aktual yang diamati antara Reviewer A dan Reviewer B.
- **$P_e$ (Expected Proportion):** Proporsi kesepakatan yang diharapkan terjadi secara kebetulan (*by chance*).

---

## 3. Matriks Kontingensi 2x2

Misalkan ada 100 artikel yang dinilai kelayakannya oleh Reviewer 1 dan Reviewer 2:

| Keputusan Reviewer | Reviewer 2: Include | Reviewer 2: Exclude | Total Baris |
| :--- | :---: | :---: | :---: |
| **Reviewer 1: Include** | **40** (Keduanya Setuju Include) | **10** (Konflik) | **50** |
| **Reviewer 1: Exclude** | **5** (Konflik) | **45** (Keduanya Setuju Exclude) | **50** |
| **Total Kolom** | **45** | **55** | **N = 100** |

Perhitungannya:
- $P_o = \\frac{40 + 45}{100} = 0.85$ (85% kesepakatan aktual).
- Kesepakatan acak ($P_e$):
  - Peluang keduanya acak "Include": $\\frac{50}{100} \\times \\frac{45}{100} = 0.225$
  - Peluang keduanya acak "Exclude": $\\frac{50}{100} \\times \\frac{55}{100} = 0.275$
  - $P_e = 0.225 + 0.275 = 0.50$
- **Nilai Kappa (κ):**
  $$\\kappa = \\frac{0.85 - 0.50}{1 - 0.50} = \\frac{0.35}{0.50} = \\mathbf{0.70}$$

---

## 4. Tabel Interpretasi Landis & Koch

| Nilai Kappa (κ) | Tingkat Kesepakatan (*Strength of Agreement*) | Kesiapan untuk Publikasi Jurnal |
| :--- | :--- | :--- |
| **< 0.00** | Buruk (*Poor agreement*) | Perlu kalibrasi ulang kriteria inklusi. |
| **0.01 – 0.20** | Sangat Rendah (*Slight*) | Kriteria kelaikan ambigu. |
| **0.21 – 0.40** | Cukup Rendah (*Fair*) | Diperlukan penyamaan persepsi protokol. |
| **0.41 – 0.60** | Sedang (*Moderate*) | Diterima untuk tinjauan eksploratif. |
| **0.61 – 0.80** | **Substansial (*Substantial*)** | **Standar ideal jurnal terindeks Scopus.** |
| **0.81 – 1.00** | Hampir Sempurna (*Almost Perfect*) | Bukti konsistensi metodologis prima. |

---

## 5. Prosedur Resolusi Konflik (Conflict Adjudication)

Ketika Reviewer 1 memilih *Include* sementara Reviewer 2 memilih *Exclude*, artikel tersebut masuk ke status **Screening Conflict**. 

Bagaimana cara menyelesaikannya secara etis?
1. **Konsensus Diskusi Bersama:** Kedua reviewer duduk bersama, membaca ulang teks lengkap artikel, mencocokkan dengan kriteria inklusi/eksklusi protokol, dan menyepakati keputusan final.
2. **Keterlibatan Reviewer Ketiga (*Arbitrator / Adjudicator*):** Jika konsensus tidak tercapai, seorang peneliti senior independen ditugaskan membaca artikel dan memberikan keputusan akhir yang mengikat.

Seluruh rekam jejak konflik dan resolusi ini harus tercatat dengan baik sebagai bagian dari bukti audit penelitian.
`,
  },
  {
    slug: "evaluasi-kualitas-studi-rob2-dan-robins-i-cochrane",
    title: "Panduan Lengkap Penilaian Kualitas Metodologis Studi: Menggunakan RoB 2 dan ROBINS-I Sesuai Standar Cochrane",
    excerpt: "Kupas tuntas 5 domain Cochrane RoB 2 untuk Randomized Controlled Trials (RCT) dan 7 domain ROBINS-I untuk studi non-acak dalam telaah kritis literatur sistematis.",
    category: "Penilaian Kritis",
    readTime: "11 min read",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-22",
    author: {
      name: "dr. Ibnu Setiawan",
      role: "Lead Medical Informatics Researcher",
    },
    tags: ["Risk of Bias", "RoB 2", "ROBINS-I", "Cochrane", "Critical Appraisal"],
    content: `
## 1. Mengapa Penilaian Kualitas Metodologis (*Risk of Bias*) Wajib Dilakukan?

Tidak semua artikel yang berhasil lolos tahap *full-text screening* memiliki kualitas metodologis yang setara. Sebuah studi dengan sampel kecil, metode randomisasi yang cacat, atau pelaporan data luaran yang parsial dapat menghasilkan simpulan yang menyesatkan jika dimasukkan begitu saja ke dalam sintesis bukti ilmiah Anda.

Oleh karena itu, **Cochrane Collaboration** menetapkan bahwa setiap telaah sistematis wajib menyertakan penilaian risiko bias (*Critical Appraisal / Risk of Bias Assessment*) menggunakan instrumen baku yang tervalidasi.

---

## 2. Mengenal Cochrane RoB 2 (Randomized Controlled Trials)

Alat **RoB 2 (*Risk of Bias 2*)** adalah standar emas internasional untuk menilai uji klinis acak (*Randomized Controlled Trials* / RCT). RoB 2 menilai bias dalam **5 domain utama**:

### Domain 1: Bias yang Timbul dari Proses Randomisasi (*Randomization Process*)
- Apakah urutan alokasi diacak secara benar (*computer-generated random sequence*)?
- Apakah alokasi disembunyikan (*concealment of allocation*) hingga intervensi diberikan?
- Apakah terdapat ketimpangan signifikan karakteristik demografis dasar antar-kelompok?

### Domain 2: Bias Akibat Penyimpangan dari Intervensi yang Ditetapkan (*Deviations from Intended Interventions*)
- Apakah partisipan dan tenaga medis dibutakan (*double-blinded*) terhadap perlakuan?
- Apakah ada penanganan memadai terhadap partisipan yang tidak patuh terhadap protokol?

### Domain 3: Bias Akibat Data Luaran yang Hilang (*Missing Outcome Data*)
- Apakah data luaran tersedia untuk semua atau hampir semua partisipan?
- Apakah rasio *loss to follow-up* seimbang antar-kelompok kontrol dan intervensi?

### Domain 4: Bias dalam Pengukuran Luaran (*Measurement of the Outcome*)
- Apakah penilai luaran (*outcome assessors*) mengetahui intervensi yang diterima pasien?
- Apakah instrumen pengukuran luaran tervalidasi dan objektif?

### Domain 5: Bias dalam Pemilihan Luaran yang Dilaporkan (*Selection of the Reported Result*)
- Apakah data dianalisis sesuai rencana pra-spesifikasi dalam protokol terdaftar (misal di ClinicalTrials.gov)?
- Apakah ada indikasi penulis hanya melaporkan luaran yang hasilnya signifikan secara statistik (*p-hacking*)?

---

## 3. Matriks Keputusan Akhir Risiko Bias

Setiap studi pada akhirnya dikategorikan ke dalam salah satu dari tiga tingkatan:
1. **Low Risk of Bias (Risiko Rendah):** Studi dinilai berisiko rendah di kelima domain. Bukti sangat kredibel.
2. **Some Concerns (Beberapa Kekhawatiran):** Studi dinilai memiliki catatan di minimal satu domain, namun tidak berisiko tinggi.
3. **High Risk of Bias (Risiko Tinggi):** Studi dinilai berisiko tinggi di minimal satu domain krusial. Hasil telaah studi ini harus diinterpretasikan dengan sangat hati-hati pada bab pembahasan (*Discussion*).

---

## 4. ROBINS-I untuk Studi Non-Acak (Observasional)

Untuk studi non-randomisasi (*Non-Randomized Studies of Interventions* / NRSI), seperti studi kohort atau kasus-kontrol, gunakan **ROBINS-I** (*Risk Of Bias In Non-randomized Studies of Interventions*). ROBINS-I mencakup 7 domain yang mencakup evaluasi variabel perancu (*confounding*), seleksi partisipan, klasifikasi intervensi, hingga bias pelaporan selektif.

Hasil penilaian risiko bias ini selanjutnya disajikan dalam bentuk grafik ringkasan (*traffic light plot* atau *summary plot*) di laporan akhir tinjauan Anda.
`,
  },
  {
    slug: "perbedaan-systematic-review-scoping-review-meta-analisis",
    title: "Perbedaan Mendasar Systematic Review, Scoping Review, dan Meta-Analisis: Kapan Harus Menggunakannya?",
    excerpt: "Panduan memilih jenis sintesis bukti yang tepat untuk tesis, disertasi, atau manuskrip publikasi Anda berdasarkan tujuan penelitian, luasnya topik, dan homogenitas data.",
    category: "Metodologi Riset",
    readTime: "8 min read",
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-22",
    author: {
      name: "Tim Editorial Metodologi IB-SLR",
      role: "Academic Research Mentors",
    },
    tags: ["Scoping Review", "Systematic Review", "Meta-Analysis", "PRISMA-ScR", "Evidence Synthesis"],
    content: `
## 1. Kerancuan Terminologi dalam Sintesis Bukti

Banyak peneliti pemula, mahasiswa magister, hingga doktoral sering menyamakan antara **Systematic Review**, **Scoping Review**, dan **Meta-Analisis**. Padahal, ketiganya memiliki tujuan riset, cakupan pertanyaan, dan standar pelaporan yang berbeda. 

Memilih metode yang keliru sejak awal dapat berakibat fatal: manuskrip ditolak oleh *reviewer* jurnal dengan alasan metode riset tidak sesuai dengan rumusan masalah yang diajukan.

---

## 2. Perbandingan Komparatif Tiga Metode Utama

| Karakteristik | Systematic Literature Review (SLR) | Scoping Review (ScR) | Meta-Analisis (MA) |
| :--- | :--- | :--- | :--- |
| **Pertanyaan Riset** | Sangat terfokus & spesifik (format PICO/PECO). | Luas dan eksploratif (*broad & mapping*). | Kuantitatif terfokus pada estimasi efek intervensi. |
| **Tujuan Utama** | Menjawab efektivitas atau dampak pasti dari suatu intervensi. | Memetakan lanskap literatur yang ada dan mengidentifikasi *research gap*. | Menggabungkan data statistik dari berbagai studi secara matematis. |
| **Pedoman Pelaporan** | PRISMA 2020 Statement. | PRISMA-ScR (*Extension for Scoping Reviews*). | PRISMA 2020 + MOOSE Guidelines. |
| **Penilaian Kualitas (RoB)** | **Wajib** (*Mandatory*). | Opsional / Jarang dilakukan. | **Wajib** (*Mandatory*). |
| **Sintesis Data** | Sintesis kualitatif & naratif terstruktur. | Pemetaan deskriptif, grafik sebaran, tabel frekuensi. | Sintesis kuantitatif (*Forest Plot, Funnel Plot*). |

---

## 3. Kapan Anda Harus Memilih Scoping Review?

Gunakan **Scoping Review** jika:
- Topik yang Anda teliti masih relatif baru, berkembang pesat, dan belum banyak uji klinis acak (*RCT*) berskala besar.
- Anda ingin mengklarifikasi definisi konsep atau istilah yang digunakan secara berbeda-beda oleh berbagai disiplin ilmu.
- Anda ingin mengetahui sejauh mana literatur mengenai suatu topik telah dieksplorasi dan di mana letak kekosongan riset (*gaps in evidence*).

---

## 4. Kapan Anda Harus Memilih Systematic Review Murni?

Gunakan **Systematic Literature Review** jika:
- Pertanyaan penelitian Anda sudah sangat spesifik dan terdefinisi dengan jelas.
- Anda ingin mengevaluasi efektivitas terapi, sistem, atau metodologi tertentu dibandingkan dengan standar yang sudah ada.
- Anda memerlukan rekomendasi berbasis bukti (*evidence-based guidelines*) yang dapat diadopsi oleh praktisi, klinisi, atau pembuat kebijakan.

---

## 5. Kapan Meta-Analisis Dapat Dilakukan?

Meta-analisis **hanya dapat dilakukan** jika studi-studi primer yang lolos seleksi memiliki:
- Populasi, intervensi, pembanding, dan instrumen luaran yang **homogen** (*clinically and methodologically homogenous*).
- Data statistik kuantitatif yang lengkap (seperti *Mean & Standard Deviation*, *Risk Ratio*, *Odds Ratio*, atau *Hazard Ratio* beserta *95% Confidence Interval*).

Jika studi-studi yang ditemukan sangat heterogen (misalnya instrumen pengukuran luaran berbeda-beda), maka sintesis harus disajikan secara naratif (*Synthesis Without Meta-analysis* / SWiM), bukan dipaksakan ke dalam meta-analisis.
`,
  },
  {
    slug: "tips-menghindari-halusinasi-ai-dalam-penulisan-ilmiah",
    title: "Etika & Mitigasi Risiko AI: Menghindari Halusinasi Sitasi Jurnal dalam Riset Tesis dan Disertasi",
    excerpt: "Membedah bahaya fatal generative AI yang mengarang referensi ilmiah palsu, prinsip grounding dokumen berbasis DOI, dan panduan etis pemanfaatan AI dalam penelitian akademik.",
    category: "AI & Etika Riset",
    readTime: "9 min read",
    publishedAt: "2026-11-05",
    updatedAt: "2026-11-22",
    author: {
      name: "Tim Editorial Metodologi IB-SLR",
      role: "AI Ethics & Academic Integrity Advisory",
    },
    tags: ["AI Hallucination", "Academic Ethics", "Research Integrity", "Grounding", "DOI Verification"],
    content: `
## 1. Ancaman Fenomena "Citation Hallucination"

Kehadiran model bahasa besar (*Large Language Models* / LLM) seperti GPT-4 dan model generasi teks generatif lainnya telah merevolusi produktivitas penulisan. Namun, di dunia akademis, model AI generatif murni memiliki kelemahan fatal: **Halusinasi Referensi (*Citation Hallucination*)**.

Secara arsitektural, LLM bekerja berdasarkan probabilitas token kata berikutnya (*predicting the next token*), bukan berdasarkan database fakta yang terverifikasi. Ketika diminta menyertakan referensi untuk mendukung suatu argumen ilmiah, LLM dapat mengarang nama penulis ternama, judul artikel yang terdengar sangat meyakinkan, nama jurnal bergengsi, hingga nomor volume dan tahun yang sama sekali **tidak pernah ada di dunia nyata**.

Menyertakan referensi halusinasi dalam tesis, disertasi, atau naskah jurnal internasional dapat dikategorikan sebagai **pelanggaran integritas ilmiah serius (*scientific misconduct*)** dan berujung pada sanksi pencabutan gelar atau penolakan naskah (*retraction*).

---

## 2. Mengapa Halusinasi AI Sangat Berbahaya dalam SLR?

Dalam Systematic Literature Review, setiap angka yang tercantum di diagram PRISMA harus dapat dipertanggungjawabkan hingga ke berkas PDF aslinya. Jika satu artikel halusinasi masuk ke dalam matriks sintesis:
1. Rekapitulasi jumlah artikel inklusi menjadi palsu.
2. Ekstraksi data luaran tidak memiliki sumber rujukan primer.
3. Reprodusibilitas penelitian gugur total saat diuji oleh peninjau independen (*peer reviewer*).

---

## 3. Prinsip "Strict Document Grounding" di Platform IB-SLR

Untuk mengatasi risiko tersebut, platform **IB-SLR** menerapkan arsitektur **Strict Document Grounding**:

\`\`\`
[Unggah PDF / File RIS] -> [Pemeriksaan DOI Resmi di Crossref/PubMed] -> [Bounding-Box Text Extraction] -> [Human Verification]
\`\`\`

- **Verifikasi Metadata Otomatis:** Setiap artikel yang diimpor wajib memiliki tautan DOI atau PubMed ID (PMID) yang aktif dan tervalidasi ke registri Crossref.
- **Ekstraksi Berbasis Koordinat (Bounding Box):** Ketika sistem AI membantu mengekstrak data dari naskah, sistem menunjuk lokasi halaman dan baris kalimat asli (*bounding box reference*), bukan menyimpulkan sendiri tanpa bukti.
- **Human-in-the-Loop Principle:** Keputusan eksklusi dan inklusi artikel tetap berada 100% di tangan peneliti manusia (*human reviewer*). AI hanya bertindak sebagai asisten pemercepat pembacaan teks.

---

## 4. Panduan Etis Penggunaan AI dalam Manuskrip Ilmiah

Penerbit internasional terkemuka (seperti Elsevier, Springer Nature, Wiley, dan IEEE) telah mengeluarkan panduan resmi terkait AI:
1. **AI Tidak Boleh Dicantumkan Sebagai Penulis (*Authorship*):** AI tidak dapat memikul tanggung jawab hukum dan etis atas isi tulisan.
2. **Deklarasi Transparan (*AI Usage Disclosure*):** Penulis wajib mencantumkan pernyataan di bab metodologi atau ucapan terima kasih (*Acknowledgements*) jika menggunakan alat bantu AI, menyebutkan nama perangkat lunak dan tujuan penggunaannya (misalnya untuk penyuntingan tata bahasa bahasa Inggris).
3. **Verifikasi Manual 100% Referensi:** Setiap sitasi dalam daftar pustaka wajib diperiksa langsung di basis data resmi (Google Scholar, Scopus, PubMed, atau DOI resolver).
`,
  },
  {
    slug: "strategi-lolos-peer-review-jurnal-internasional-scopus-q1-q2",
    title: "Strategi Lolos Peer Review Jurnal Internasional Bereputasi (Scopus Q1/Q2) dengan Metodologi Riset Transparan",
    excerpt: "Tips praktis menyusun naskah Systematic Literature Review yang disukai editor jurnal internasional, menyertakan checklist PRISMA 2020, dan merespons komentar reviewer dengan diplomatis.",
    category: "Publikasi Ilmiah",
    readTime: "11 min read",
    publishedAt: "2026-11-01",
    updatedAt: "2026-11-22",
    author: {
      name: "Tim Editorial Metodologi IB-SLR",
      role: "Academic Publishing Board",
    },
    tags: ["Scopus Q1", "Peer Review", "Journal Publication", "PRISMA Checklist", "Academic Writing"],
    content: `
## 1. Realitas Tingkat Penolakan (*Desk Rejection*) di Jurnal Q1

Jurnal-jurnal internasional bereputasi di kuartil tertinggi (Scopus Q1 dan Q2) menerima ratusan manuskrip tinjauan pustaka setiap bulannya. Rata-rata tingkat penolakan awal oleh Editor-in-Chief (*desk rejection rate*) mencapai **60% hingga 80%**, bahkan sebelum naskah dikirim ke *peer reviewer*.

Alasan utama *desk reject* bukan karena topik penelitian tidak menarik, melainkan karena **kegagalan mematuhi standar metodologi internasional yang transparan**. 

---

## 2. Lima Berkas Wajib yang Harus Disertakan Saat Submit Naskah

Saat mengunggah manuskrip SLR Anda ke portal jurnal (*Editorial Manager, ScholarOne, dll.*), pastikan Anda menyertakan berkas pelengkap berikut:

1. **Naskah Utama (*Main Manuscript*):** Berisi abstrak terstruktur, pendahuluan dengan identifikasi kesenjangan riset (*gap*), metodologi PRISMA 2020, hasil sintesis bukti, dan pembahasan kritis.
2. **Diagram Alir PRISMA 2020 Resolusi Tinggi:** Berkas vektor (PDF/SVG/PNG 300 DPI) yang memperlihatkan angka alir artikel dari tahap identifikasi hingga inklusi secara konsisten.
3. **Lampiran Checklist PRISMA 2020 (*Completed 27-Item Checklist*):** Dokumen tabel yang merinci nomor halaman persis di mana masing-masing dari 27 butir PRISMA dibahas dalam naskah Anda.
4. **Strategi Pencarian Lengkap (*Full Search Strategy Appendices*):** String kueri persis yang dijalankan pada setiap database beserta tanggal eksekusinya.
5. **Matriks Penilaian Risiko Bias (*Risk of Bias Assessment Matrix*):** Tabel detail skor evaluasi RoB 2, ROBINS-I, atau NOS untuk setiap studi yang disertakan.

---

## 3. Menghindari "Mathematical Inconsistency" pada Angka PRISMA

Salah satu tanda bahaya (*red flag*) paling umum yang langsung memicu kecurigaan *reviewer* adalah ketidaksinkronan hitungan matematika di dalam diagram PRISMA:

\`\`\`
Total Identifikasi = (Hasil Database A + Hasil Database B)
Total Screening = (Total Identifikasi - Jumlah Duplikat Dihapus)
Total Eligibility = (Total Screening - Jumlah Eksklusi Judul/Abstrak)
Total Inklusi = (Total Eligibility - Jumlah Eksklusi Teks Lengkap)
\`\`\`

Jika angka-angka tersebut tidak cocok saat dijumlahkan atau dikurangkan, reviewer akan langsung meragukan ketelitian dan validitas keseluruhan penelitian Anda. Platform **IB-SLR** secara otomatis merekonsiliasi angka-angka ini secara matematis secara *real-time* untuk mencegah kesalahan hitung manual.

---

## 4. Cara Merespons Komentar Peer Reviewer Secara Diplomatis

Jika naskah Anda mendapatkan keputusan **Major Revision** atau **Minor Revision**, Anda telah melewati rintangan terbesar. Kunci sukses tahap revisi adalah menyusun dokumen tanggapan (*Response to Reviewers*) yang sistematis:

- **Gunakan Format Point-by-Point:** Salin setiap komentar reviewer kata-demi-kata, lalu sertakan jawaban Anda tepat di bawahnya.
- **Tunjukkan Lokasi Perubahan yang Jelas:** Selalu sebutkan: *"Page X, Line Y, Paragraph Z"*, dan gunakan warna atau fitur *track changes* pada naskah revisi.
- **Sikap Sopan dan Profesional:** Bahkan jika Anda tidak setuju dengan masukan reviewer, sampaikan argumen Anda dengan landasan bukti ilmiah yang kuat dan bahasa akademis yang santun.

Dengan persiapan metodologi yang kokoh sejak awal, peluang manuskrip Systematic Literature Review Anda untuk terbit di jurnal bereputasi internasional akan meningkat secara signifikan.
`,
  },
];

export function getAllArticles(): BlogArticle[] {
  return BLOG_ARTICLES;
}

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(currentSlug: string, category: string, limit = 3): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.slug !== currentSlug && a.category === category)
    .concat(BLOG_ARTICLES.filter((a) => a.slug !== currentSlug && a.category !== category))
    .slice(0, limit);
}

export function getAllCategories(): string[] {
  const cats = new Set(BLOG_ARTICLES.map((a) => a.category));
  return Array.from(cats);
}
