"use server";

import {
  saveAppraisalRecord,
  saveThematicCode,
  deleteThematicCode,
  saveThematicExcerpt,
  deleteThematicExcerpt,
} from "../db";
import { AppraisalRecord } from "../types/appraisal";
import { ThematicCode, ThematicExcerpt } from "../types/synthesis";
import { getCurrentSession } from "../auth/session";

export async function saveAppraisalRecordAction(
  record: AppraisalRecord
): Promise<{ success: boolean; record?: AppraisalRecord; error?: string }> {
  try {
    const session = await getCurrentSession();
    const saved = await saveAppraisalRecord(record, session?.userId, session?.email);
    return { success: true, record: saved };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan penilaian kualitas." };
  }
}

export async function saveThematicCodeAction(
  code: ThematicCode
): Promise<{ success: boolean; code?: ThematicCode; error?: string }> {
  try {
    const session = await getCurrentSession();
    const saved = await saveThematicCode(code, session?.userId, session?.email);
    return { success: true, code: saved };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan kode tematik." };
  }
}

export async function deleteThematicCodeAction(
  codeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentSession();
    const ok = await deleteThematicCode(codeId, session?.userId, session?.email);
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus kode tematik." };
  }
}

export async function saveThematicExcerptAction(
  excerpt: ThematicExcerpt
): Promise<{ success: boolean; excerpt?: ThematicExcerpt; error?: string }> {
  try {
    const session = await getCurrentSession();
    const saved = await saveThematicExcerpt(excerpt, session?.userId, session?.email);
    return { success: true, excerpt: saved };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan kutipan kode tematik." };
  }
}

export async function deleteThematicExcerptAction(
  excerptId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentSession();
    const ok = await deleteThematicExcerpt(excerptId, session?.userId, session?.email);
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus kutipan tematik." };
  }
}
