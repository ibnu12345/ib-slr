"use server";

import { revalidatePath } from "next/cache";
import { requireEmailVerified } from "../auth/session";
import {
  recordScreeningDecision,
  recordScreeningDecisionsBatch,
  adjudicateConflict,
} from "../db";
import { ScreeningStage, ScreeningDecisionType } from "../types/screening";

export async function submitScreeningDecisionAction(formData: FormData) {
  const session = await requireEmailVerified();

  const projectId = formData.get("projectId")?.toString();
  const articleId = formData.get("articleId")?.toString();
  const stage = (formData.get("stage")?.toString() || "title_abstract") as ScreeningStage;
  const decision = formData.get("decision")?.toString() as ScreeningDecisionType;
  const exclusionReason = formData.get("exclusionReason")?.toString() || undefined;
  const notes = formData.get("notes")?.toString() || undefined;

  if (!projectId || !articleId || !decision) {
    return { success: false, error: "Project ID, Article ID, and decision are required." };
  }

  if (decision === "exclude" && !exclusionReason) {
    return {
      success: false,
      error: "Alasan eksklusi wajib dipilih ketika mengeluarkan artikel.",
    };
  }

  try {
    const res = await recordScreeningDecision(
      projectId,
      articleId,
      session.userId,
      session.fullName || session.email,
      stage,
      decision,
      exclusionReason,
      notes
    );

    // Invalidate summary views without re-rendering active studio props on every click
    revalidatePath(`/app/projects/${projectId}/prisma`);
    revalidatePath(`/app/projects/${projectId}/overview`);

    return {
      success: true,
      decision: res.decision,
      newStatus: res.status,
      message: `Keputusan screening tercatat: ${decision.toUpperCase()}`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mencatat keputusan screening." };
  }
}

export async function syncScreeningDecisionsBatchAction(formData: FormData) {
  const session = await requireEmailVerified();

  const projectId = formData.get("projectId")?.toString();
  const stage = (formData.get("stage")?.toString() || "full_text") as ScreeningStage;
  const decisionsJson = formData.get("decisions")?.toString();

  if (!projectId || !decisionsJson) {
    return { success: false, error: "Missing required batch parameters." };
  }

  try {
    const decisions = JSON.parse(decisionsJson);
    if (!Array.isArray(decisions) || decisions.length === 0) {
      return { success: true, count: 0 };
    }

    const res = await recordScreeningDecisionsBatch(
      projectId,
      stage,
      decisions,
      session.userId,
      session.fullName || session.email
    );

    revalidatePath(`/app/projects/${projectId}/prisma`);
    revalidatePath(`/app/projects/${projectId}/overview`);

    return { success: true, count: res.count, message: `${res.count} keputusan berhasil disinkronisasi ke cloud.` };
  } catch (err: any) {
    console.error("syncScreeningDecisionsBatchAction error:", err);
    return { success: false, error: err.message || "Gagal menyinkronkan keputusan batch." };
  }
}

export async function adjudicateConflictAction(formData: FormData) {
  const session = await requireEmailVerified();

  const conflictId = formData.get("conflictId")?.toString();
  const projectId = formData.get("projectId")?.toString();
  const resolvedDecision = formData.get("resolvedDecision")?.toString() as ScreeningDecisionType;
  const exclusionReason = formData.get("exclusionReason")?.toString() || undefined;
  const adjudicationNotes = formData.get("adjudicationNotes")?.toString() || undefined;

  if (!conflictId || !projectId || !resolvedDecision) {
    return { success: false, error: "Missing required adjudication fields." };
  }

  try {
    const success = await adjudicateConflict(
      conflictId,
      resolvedDecision,
      exclusionReason,
      session.userId,
      session.fullName || session.email,
      adjudicationNotes
    );

    revalidatePath(`/app/projects/${projectId}/conflicts`);
    revalidatePath(`/app/projects/${projectId}/library`);
    revalidatePath(`/app/projects/${projectId}/prisma`);

    return { success, message: "Konflik berhasil diadjudikasi dan status artikel diperbarui." };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal melakukan adjudikasi." };
  }
}
