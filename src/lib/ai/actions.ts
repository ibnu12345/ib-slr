"use server";

import {
  getArticleById,
  getCriteriaByProjectId,
  getProtocolByProjectId,
  getAIScreeningSuggestion,
  saveAIScreeningSuggestion,
  getExtractionTemplates,
  getExtractedDataRecords,
  saveExtractedDataRecord,
  verifyExtractedField,
  updateArticlePdf,
} from "../db";
import { screenArticleWithAI, extractFieldsWithAI, askArticleEvidenceAI } from "./service";
import { AIScreeningSuggestion, AIArticleQAResponse } from "../types/ai";
import { ExtractedDataRecord, FieldVerificationState, ExtractionTemplate } from "../types/extraction";
import { getCurrentSession } from "../auth/session";

export async function getOrGenerateAIScreeningAction(
  articleId: string,
  projectId: string
): Promise<{ success: boolean; suggestion?: AIScreeningSuggestion; error?: string }> {
  try {
    const existing = await getAIScreeningSuggestion(articleId);
    if (existing) {
      return { success: true, suggestion: existing };
    }

    const [article, criteria, protocol] = await Promise.all([
      getArticleById(articleId),
      getCriteriaByProjectId(projectId),
      getProtocolByProjectId(projectId),
    ]);

    if (!article) {
      return { success: false, error: "Artikel tidak ditemukan." };
    }

    const suggestion = await screenArticleWithAI(article, criteria, protocol || undefined);
    await saveAIScreeningSuggestion(suggestion);

    return { success: true, suggestion };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghasilkan evaluasi AI." };
  }
}

export async function askArticleEvidenceAction(
  articleId: string,
  question: string
): Promise<{ success: boolean; response?: AIArticleQAResponse; error?: string }> {
  try {
    if (!question || question.trim().length === 0) {
      return { success: false, error: "Pertanyaan tidak boleh kosong." };
    }

    const article = await getArticleById(articleId);
    if (!article) {
      return { success: false, error: "Artikel tidak ditemukan." };
    }

    const response = await askArticleEvidenceAI(article, question.trim());
    return { success: true, response };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menjawab pertanyaan artikel." };
  }
}

export async function runAIExtractionForArticleAction(
  articleId: string,
  projectId: string,
  templateId?: string
): Promise<{ success: boolean; record?: ExtractedDataRecord; error?: string }> {
  try {
    const session = await getCurrentSession();
    const [article, templates] = await Promise.all([
      getArticleById(articleId),
      getExtractionTemplates(projectId),
    ]);

    if (!article) {
      return { success: false, error: "Artikel tidak ditemukan." };
    }

    const template = templateId
      ? templates.find((t) => t.id === templateId)
      : templates.find((t) => t.isDefault) || templates[0];

    if (!template) {
      return { success: false, error: "Template ekstraksi tidak ditemukan." };
    }

    const aiResult = await extractFieldsWithAI(article, template);

    // Transform into ExtractedDataRecord
    const values: Record<string, any> = {};
    const evidence: Record<string, any> = {};
    const verificationStatus: Record<string, FieldVerificationState> = {};

    for (const [key, fieldData] of Object.entries(aiResult.fields)) {
      values[key] = fieldData.value;
      evidence[key] = {
        quote: fieldData.verbatimQuote,
        pageNumber: fieldData.pageNumber,
        section: fieldData.sectionName,
        confidenceRating: fieldData.confidenceRating,
        isFound: fieldData.isFound,
        rationale: fieldData.rationale,
      };
      verificationStatus[key] = "pending";
    }

    const existingRecords = await getExtractedDataRecords(projectId, articleId);
    const existing = existingRecords.find((r) => r.templateId === template.id);

    const record: ExtractedDataRecord = {
      id: existing ? existing.id : `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      articleId,
      templateId: template.id,
      values,
      evidence,
      verificationStatus,
      status: "in_progress",
      extractedBy: "ai_assisted",
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveExtractedDataRecord(record, session?.userId, session?.email);
    return { success: true, record: saved };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengekstraksi data otomatis." };
  }
}

export async function verifyExtractionFieldAction(
  recordId: string,
  fieldKey: string,
  status: FieldVerificationState,
  correctedValue?: any
): Promise<{ success: boolean; record?: ExtractedDataRecord; error?: string }> {
  try {
    const session = await getCurrentSession();
    const record = await verifyExtractedField(
      recordId,
      fieldKey,
      status,
      correctedValue,
      session?.fullName || session?.email || "Reviewer"
    );
    return { success: true, record };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memverifikasi field data." };
  }
}

export async function uploadArticlePdfAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; article?: any }> {
  try {
    const session = await getCurrentSession();
    const articleId = formData.get("articleId") as string;
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("pastedText") as string | null;

    if (!articleId) {
      return { success: false, error: "ID artikel wajib disertakan." };
    }

    if (file && file.size > 0) {
      // Validate MIME type
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return { success: false, error: "Format file tidak valid. Hanya file PDF yang diperbolehkan." };
      }

      // Max size: 25MB
      if (file.size > 25 * 1024 * 1024) {
        return { success: false, error: "Ukuran file terlalu besar. Maksimum ukuran PDF adalah 25MB." };
      }

      // Read text content or set up mock native extracted structure
      const fileName = file.name;
      const fileSize = file.size;

      const updated = await updateArticlePdf(
        articleId,
        {
          pdfFileName: fileName,
          pdfFileSize: fileSize,
          pdfUrl: `/uploads/${fileName}`,
          ocrQuality: "native",
          pageCount: 6,
        },
        session?.userId,
        session?.email
      );

      return { success: true, article: updated };
    } else if (pastedText && pastedText.trim().length > 0) {
      const updated = await updateArticlePdf(
        articleId,
        {
          extractedText: pastedText.trim(),
          ocrQuality: "native",
          pageCount: 3,
        },
        session?.userId,
        session?.email
      );
      return { success: true, article: updated };
    }

    return { success: false, error: "File PDF atau teks dokumen wajib disertakan." };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah dokumen PDF." };
  }
}
