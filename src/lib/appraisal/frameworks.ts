import { AppraisalFramework } from "../types/appraisal";

export const standardAppraisalFrameworks: AppraisalFramework[] = [
  {
    id: "rob-2-rct",
    code: "RoB2",
    name: "Cochrane RoB 2 (Risk of Bias in Randomized Trials)",
    description: "Standard gold-standard instrument for assessing risk of bias across five methodological domains in randomized parallel-group trials.",
    targetStudyDesign: "Randomized Controlled Trial (RCT)",
    domains: [
      {
        id: "d1",
        key: "d1_randomization",
        label: "Domain 1: Proses Randomisasi (Randomization Process)",
        guidance: "Apakah urutan alokasi acak, tersembunyi (concealed), dan tidak terdapat ketidakseimbangan baseline yang mencurigakan?",
      },
      {
        id: "d2",
        key: "d2_deviations",
        label: "Domain 2: Deviasi dari Intervensi yang Diniatkan (Deviations from Intended Interventions)",
        guidance: "Apakah terdapat deviasi dari intervensi akibat konteks uji coba atau kegagalan blinding peserta dan pengasuh?",
      },
      {
        id: "d3",
        key: "d3_missing_data",
        label: "Domain 3: Data Luaran yang Hilang (Missing Outcome Data)",
        guidance: "Apakah data luaran tersedia untuk seluruh atau hampir seluruh partisipan yang dirandomisasi (rendah attrition bias)?",
      },
      {
        id: "d4",
        key: "d4_measurement",
        label: "Domain 4: Pengukuran Luaran (Measurement of the Outcome)",
        guidance: "Apakah metode pengukuran luaran objektif dan bebas dari bias penilai (assessor blinding)?",
      },
      {
        id: "d5",
        key: "d5_selective_reporting",
        label: "Domain 5: Seleksi Hasil yang Dilaporkan (Selection of the Reported Result)",
        guidance: "Apakah hasil yang dilaporkan sesuai dengan protokol analisis pra-spesifikasi tanpa p-hacking atau selective reporting?",
      },
    ],
  },
  {
    id: "casp-qualitative",
    code: "CASP_Qualitative",
    name: "CASP Checklist (Qualitative Research Appraisal)",
    description: "10-question critical appraisal instrument for evaluating trustworthiness, qualitative rigor, and reflexivity in qualitative studies.",
    targetStudyDesign: "Qualitative Study / Grounded Theory / Phenomenology",
    domains: [
      {
        id: "d-casp-1",
        key: "aims_and_methodology",
        label: "Kesesuaian Metodologi & Tujuan (Research Aims & Methodology)",
        guidance: "Apakah tujuan penelitian jelas dan metodologi kualitatif tepat untuk menjawab pertanyaan riset?",
      },
      {
        id: "d-casp-2",
        key: "recruitment_and_reflexivity",
        label: "Rekrutmen & Refleksivitas Peneliti (Recruitment & Reflexivity)",
        guidance: "Apakah strategi rekrutmen tepat dan peneliti secara kritis menguji hubungan serta potensi bias dengan partisipan?",
      },
      {
        id: "d-casp-3",
        key: "data_analysis_rigor",
        label: "Rigoritas Analisis Data (Data Analysis Rigor)",
        guidance: "Apakah analisis tematik dilakukan secara mendalam, transparan, dan didukung bukti kutipan verbatim?",
      },
      {
        id: "d-casp-4",
        key: "findings_value",
        label: "Nilai & Pernyataan Temuan (Value & Credibility of Findings)",
        guidance: "Apakah temuan memiliki kredibilitas ilmiah dan kontribusi yang jelas terhadap praktik klinis atau kebijakan?",
      },
    ],
  },
  {
    id: "jbi-quasi-cohort",
    code: "JBI_Cohort",
    name: "JBI Critical Appraisal (Cohort & Quasi-Experimental)",
    description: "Joanna Briggs Institute appraisal tool evaluating temporal sequence, exposure measurement, confounding, and follow-up completeness.",
    targetStudyDesign: "Prospective Cohort / Quasi-Experimental Study",
    domains: [
      {
        id: "d-jbi-1",
        key: "group_comparability",
        label: "Komparabilitas Kelompok (Group Comparability)",
        guidance: "Apakah kedua kelompok serupa pada baseline dan faktor perancu (confounding) diidentifikasi serta dikontrol?",
      },
      {
        id: "d-jbi-2",
        key: "exposure_measurement",
        label: "Pengukuran Pajanan & Luaran (Exposure & Outcome Measurement)",
        guidance: "Apakah pajanan dan luaran diukur secara valid dan reliabel dengan kriteria objektif?",
      },
      {
        id: "d-jbi-3",
        key: "follow_up_completeness",
        label: "Kelengkapan Tindak Lanjut (Follow-up Completeness)",
        guidance: "Apakah waktu tindak lanjut cukup panjang dan strategi mengatasi loss-to-follow-up dianalisis secara tepat?",
      },
    ],
  },
  {
    id: "mmat-mixed-methods",
    code: "MMAT",
    name: "MMAT (Mixed Methods Appraisal Tool)",
    description: "Evaluates the integration and methodological validity of combined qualitative and quantitative components.",
    targetStudyDesign: "Mixed Methods Study",
    domains: [
      {
        id: "d-mmat-1",
        key: "integration_rationale",
        label: "Rasional Integrasi Metode (Integration Design)",
        guidance: "Apakah integrasi kualitatif dan kuantitatif relevan untuk menjawab pertanyaan riset secara komprehensif?",
      },
      {
        id: "d-mmat-2",
        key: "component_quality",
        label: "Kualitas Masing-Masing Komponen (Component Quality)",
        guidance: "Apakah komponen kualitatif dan kuantitatif memenuhi standar rigoritas ilmiah disiplin masing-masing?",
      },
      {
        id: "d-mmat-3",
        key: "divergence_handling",
        label: "Penanganan Inkonsistensi (Handling Divergence)",
        guidance: "Apakah ketidaksesuaian antara temuan kualitatif dan kuantitatif dieksplorasi secara transparan?",
      },
    ],
  },
];
