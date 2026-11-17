"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireEmailVerified } from "../auth/session";
import {
  createProject,
  saveProtocol,
  lockProtocol,
  saveCriterion,
  deleteCriterion,
  createSearchRun,
  importArticlesBatch,
  runDuplicateDetection,
  mergeDuplicateArticles,
  dismissDuplicateCandidate,
  getProjectById,
  getProtocolByProjectId,
} from "../db";
import { parseRis, parseBibTeX, parseCsv } from "../importers/parsers";
import { ProtocolFramework, ReviewType } from "../types/research";

export async function createProjectAction(formData: FormData) {
  const session = await requireEmailVerified();

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const reviewType = (formData.get("reviewType")?.toString() || "systematic_review") as ReviewType;
  const framework = (formData.get("framework")?.toString() || "PICO") as ProtocolFramework;

  if (!title) {
    return { success: false, error: "Project title is required." };
  }

  const project = await createProject(
    {
      workspaceId: "ws-demo-1",
      title,
      description,
      reviewType,
      status: "active",
      createdBy: session.userId,
    },
    session.userId,
    session.email
  );

  // Set framework on initial protocol
  const proto = await getProtocolByProjectId(project.id);
  if (proto) {
    proto.framework = framework;
    await saveProtocol(proto, session.userId, session.email);
  }

  revalidatePath("/app");
  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${project.id}`);
  revalidatePath(`/app/projects/${project.id}/overview`);
  revalidatePath(`/app/projects/${project.id}/protocol`);
  return { success: true, project };
}

export async function saveProtocolAction(formData: FormData) {
  const session = await requireEmailVerified();

  const projectId = formData.get("projectId")?.toString();
  const framework = (formData.get("framework")?.toString() || "PICO") as ProtocolFramework;
  const background = formData.get("background")?.toString() || "";
  const objectives = formData.get("objectives")?.toString() || "";

  // PICO fields
  const picoPopulation = formData.get("picoPopulation")?.toString() || "";
  const picoIntervention = formData.get("picoIntervention")?.toString() || "";
  const picoComparator = formData.get("picoComparator")?.toString() || "";
  const picoOutcome = formData.get("picoOutcome")?.toString() || "";

  // PICo fields
  const picoInterest = formData.get("picoInterest")?.toString() || "";
  const picoContext = formData.get("picoContext")?.toString() || "";

  // SPIDER fields
  const spiderSample = formData.get("spiderSample")?.toString() || "";
  const spiderPhenomenon = formData.get("spiderPhenomenon")?.toString() || "";
  const spiderDesign = formData.get("spiderDesign")?.toString() || "";
  const spiderEvaluation = formData.get("spiderEvaluation")?.toString() || "";
  const spiderResearchType = formData.get("spiderResearchType")?.toString() || "";

  if (!projectId) {
    return { success: false, error: "Project ID is required." };
  }

  const existing = await getProtocolByProjectId(projectId);
  const version = existing ? existing.version : 1;

  try {
    const saved = await saveProtocol(
      {
        id: existing ? existing.id : `proto-${projectId}`,
        projectId,
        version,
        framework,
        background,
        objectives,
        picoPopulation,
        picoIntervention,
        picoComparator,
        picoOutcome,
        picoInterest,
        picoContext,
        spiderSample,
        spiderPhenomenon,
        spiderDesign,
        spiderEvaluation,
        spiderResearchType,
        isLocked: false,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      session.userId,
      session.email
    );

    revalidatePath(`/app/projects/${projectId}/protocol`);
    return { success: true, protocol: saved, message: "Protocol specifications saved." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save protocol." };
  }
}

export async function lockProtocolAction(projectId: string) {
  const session = await requireEmailVerified();
  try {
    const locked = await lockProtocol(projectId, session.userId, session.email);
    revalidatePath(`/app/projects/${projectId}/protocol`);
    return { success: true, protocol: locked, message: "Protocol successfully locked for screening." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to lock protocol." };
  }
}

export async function saveCriterionAction(formData: FormData) {
  const session = await requireEmailVerified();

  const id = formData.get("id")?.toString() || `crit-${Date.now()}`;
  const projectId = formData.get("projectId")?.toString();
  const criterionType = formData.get("criterionType")?.toString() as "inclusion" | "exclusion";
  const category = formData.get("category")?.toString() || "General";
  const description = formData.get("description")?.toString().trim();
  const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "1", 10);

  if (!projectId || !description) {
    return { success: false, error: "Project ID and criterion description are required." };
  }

  await saveCriterion(
    {
      id,
      projectId,
      criterionType,
      category,
      description,
      sortOrder,
    },
    session.userId,
    session.email
  );

  revalidatePath(`/app/projects/${projectId}/protocol`);
  return { success: true, message: "Eligibility criterion saved." };
}

export async function deleteCriterionAction(id: string, projectId: string) {
  const session = await requireEmailVerified();
  await deleteCriterion(id, session.userId, session.email);
  revalidatePath(`/app/projects/${projectId}/protocol`);
  return { success: true };
}

export async function createSearchRunAction(formData: FormData) {
  const session = await requireEmailVerified();

  const projectId = formData.get("projectId")?.toString();
  const sourceDatabase = formData.get("sourceDatabase")?.toString().trim() || "PubMed / MEDLINE";
  const queryString = formData.get("queryString")?.toString().trim() || "";
  const resultsCount = parseInt(formData.get("resultsCount")?.toString() || "0", 10);

  if (!projectId || !queryString) {
    return { success: false, error: "Project ID and query string are required." };
  }

  const run = await createSearchRun(
    {
      projectId,
      sourceDatabase,
      queryString,
      filtersApplied: { dateLogged: new Date().toISOString() },
      searchDate: new Date().toISOString(),
      resultsCount,
      importedBy: session.userId,
    },
    session.userId,
    session.email
  );

  revalidatePath(`/app/projects/${projectId}/search`);
  return { success: true, run, message: "Search provenance strategy recorded." };
}

export async function importReferencesAction(formData: FormData) {
  const session = await requireEmailVerified();

  const projectId = formData.get("projectId")?.toString();
  const format = formData.get("format")?.toString() || "ris"; // ris | bibtex | csv
  const sourceDatabase = formData.get("sourceDatabase")?.toString() || "File Import";
  const rawText = formData.get("rawText")?.toString() || "";
  const file = formData.get("file") as File | null;

  if (!projectId) {
    return { success: false, error: "Project ID is required." };
  }

  let textContent = rawText;

  if (file && file.size > 0) {
    try {
      textContent = await file.text();
    } catch {
      return { success: false, error: "Could not read uploaded file contents." };
    }
  }

  if (!textContent.trim()) {
    return { success: false, error: "Please provide a file or paste bibliographic text." };
  }

  let parsed: Array<any> = [];

  try {
    if (format === "ris") {
      parsed = parseRis(textContent);
    } else if (format === "bibtex") {
      parsed = parseBibTeX(textContent);
    } else if (format === "csv") {
      parsed = parseCsv(textContent);
    } else {
      return { success: false, error: "Unsupported bibliographic format." };
    }
  } catch (err: any) {
    return { success: false, error: `Parsing error: ${err.message}` };
  }

  if (parsed.length === 0) {
    return {
      success: false,
      error: "No valid references could be extracted. Please verify the file formatting.",
    };
  }

  // Record a search run for provenance
  const searchRun = await createSearchRun(
    {
      projectId,
      sourceDatabase,
      queryString: `Imported via ${format.toUpperCase()} batch file: ${file?.name || "Pasted text"}`,
      filtersApplied: { format, filename: file?.name },
      searchDate: new Date().toISOString(),
      resultsCount: parsed.length,
      importedBy: session.userId,
    },
    session.userId,
    session.email
  );

  // Ingest articles batch
  const res = await importArticlesBatch(
    projectId,
    parsed,
    searchRun.id,
    sourceDatabase,
    session.userId,
    session.email
  );

  // Automatically trigger duplicate detection
  await runDuplicateDetection(projectId);

  revalidatePath(`/app/projects/${projectId}/library`);
  revalidatePath(`/app/projects/${projectId}/deduplication`);
  revalidatePath(`/app/projects/${projectId}/overview`);

  return {
    success: true,
    importedCount: res.importedCount,
    message: `Successfully imported ${res.importedCount} references into library with provenance tracked.`,
  };
}

export async function runDuplicateDetectionAction(projectId: string) {
  const session = await requireEmailVerified();
  const candidates = await runDuplicateDetection(projectId);
  revalidatePath(`/app/projects/${projectId}/deduplication`);
  return { success: true, count: candidates.length };
}

export async function mergeDuplicateAction(candidateId: string, survivorId: string, duplicateId: string) {
  const session = await requireEmailVerified();
  const success = await mergeDuplicateArticles(candidateId, survivorId, duplicateId, session.userId, session.email);
  return { success };
}

export async function dismissDuplicateAction(candidateId: string) {
  const session = await requireEmailVerified();
  const success = await dismissDuplicateCandidate(candidateId, session.userId, session.email);
  return { success };
}
