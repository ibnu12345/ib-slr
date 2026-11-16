"use server";

import { saveManuscript, saveTableDefinition } from "../db";
import { ProjectManuscript, JournalTableDefinition } from "../types/publication";
import { getCurrentSession } from "../auth/session";

export async function saveManuscriptAction(
  manuscript: ProjectManuscript
): Promise<{ success: boolean; manuscript?: ProjectManuscript; error?: string }> {
  try {
    const session = await getCurrentSession();
    const saved = await saveManuscript(manuscript, session?.userId, session?.email);
    return { success: true, manuscript: saved };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan draf manuskrip." };
  }
}

export async function saveTableDefinitionAction(
  tableDef: JournalTableDefinition
): Promise<{ success: boolean; tableDefinition?: JournalTableDefinition; error?: string }> {
  try {
    const session = await getCurrentSession();
    const saved = await saveTableDefinition(tableDef, session?.userId, session?.email);
    return { success: true, tableDefinition: saved };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan konfigurasi tabel jurnal." };
  }
}
