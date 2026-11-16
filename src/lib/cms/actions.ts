"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../auth/session";
import {
  updateSiteSettings,
  savePage,
  savePageSection,
  reorderPageSections,
  saveNavigationItem,
  deleteNavigationItem,
  saveFaq,
  deleteFaq,
  getPageBySlug,
} from "../db";
import { ContentStatus, SectionType } from "../types/cms";

export async function updateSiteSettingsAction(formData: FormData) {
  const admin = await requireAdmin();

  const brandName = formData.get("brandName")?.toString() || "IB-SLR";
  const tagline = formData.get("tagline")?.toString() || "From Literature to Evidence.";
  const contactEmail = formData.get("contactEmail")?.toString() || "";
  const supportEmail = formData.get("supportEmail")?.toString() || "";
  const twitterUrl = formData.get("twitterUrl")?.toString() || "";
  const githubUrl = formData.get("githubUrl")?.toString() || "";
  const linkedinUrl = formData.get("linkedinUrl")?.toString() || "";
  const footerDisclaimer = formData.get("footerDisclaimer")?.toString() || "";

  // Announcement banner
  const announcementActive = formData.get("announcementActive") === "true";
  const announcementMessage = formData.get("announcementMessage")?.toString() || "";
  const announcementLinkUrl = formData.get("announcementLinkUrl")?.toString() || "";
  const announcementLinkText = formData.get("announcementLinkText")?.toString() || "";

  await updateSiteSettings(
    {
      brandName,
      tagline,
      contactEmail,
      supportEmail,
      twitterUrl,
      githubUrl,
      linkedinUrl,
      footerDisclaimer,
      announcement: {
        isActive: announcementActive,
        message: announcementMessage,
        linkUrl: announcementLinkUrl,
        linkText: announcementLinkText,
      },
    },
    admin.userId,
    admin.email
  );

  revalidatePath("/", "layout");
  return { success: true, message: "Site settings updated successfully." };
}

export async function savePageSectionAction(formData: FormData) {
  const admin = await requireAdmin();

  const pageId = formData.get("pageId")?.toString();
  const sectionId = formData.get("sectionId")?.toString();
  const sectionType = formData.get("sectionType")?.toString() as SectionType;
  const title = formData.get("title")?.toString();
  const subtitle = formData.get("subtitle")?.toString();
  const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "1", 10);
  const isVisible = formData.get("isVisible") === "true";
  const status = (formData.get("status")?.toString() || "published") as ContentStatus;

  // JSON Content payload
  const rawContent = formData.get("content")?.toString() || "{}";
  let content = {};
  try {
    content = JSON.parse(rawContent);
  } catch {
    return { success: false, error: "Invalid JSON content payload." };
  }

  if (!pageId || !sectionId || !sectionType) {
    return { success: false, error: "Missing required section fields." };
  }

  await savePageSection(
    pageId,
    {
      id: sectionId,
      pageId,
      sectionType,
      title,
      subtitle,
      content,
      sortOrder,
      isVisible,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    admin.userId,
    admin.email
  );

  revalidatePath("/", "layout");
  return { success: true, message: "Section saved successfully." };
}

export async function reorderSectionsAction(pageId: string, orderedSectionIds: string[]) {
  const admin = await requireAdmin();
  await reorderPageSections(pageId, orderedSectionIds, admin.userId, admin.email);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function togglePageStatusAction(slug: string, status: ContentStatus) {
  const admin = await requireAdmin();
  const page = await getPageBySlug(slug, true);
  if (!page) {
    return { success: false, error: "Page not found." };
  }

  page.status = status;
  await savePage(page, admin.userId, admin.email);
  revalidatePath("/", "layout");
  return { success: true, status };
}

export async function saveNavigationItemAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = formData.get("id")?.toString() || `nav-${Date.now()}`;
  const location = formData.get("location")?.toString() as any;
  const label = formData.get("label")?.toString() || "";
  const url = formData.get("url")?.toString() || "";
  const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0", 10);
  const isExternal = formData.get("isExternal") === "true";
  const isVisible = formData.get("isVisible") === "true";

  if (!label || !url || !location) {
    return { success: false, error: "Label, URL, and location are required." };
  }

  await saveNavigationItem(
    {
      id,
      location,
      label,
      url,
      sortOrder,
      isExternal,
      isVisible,
    },
    admin.userId,
    admin.email
  );

  revalidatePath("/", "layout");
  return { success: true, message: "Navigation item updated." };
}

export async function deleteNavigationItemAction(id: string) {
  const admin = await requireAdmin();
  await deleteNavigationItem(id, admin.userId, admin.email);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveFaqAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = formData.get("id")?.toString() || `faq-${Date.now()}`;
  const category = formData.get("category")?.toString() || "General";
  const question = formData.get("question")?.toString() || "";
  const answer = formData.get("answer")?.toString() || "";
  const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0", 10);
  const isPublished = formData.get("isPublished") === "true";

  if (!question || !answer) {
    return { success: false, error: "Question and answer are required." };
  }

  await saveFaq(
    {
      id,
      category,
      question,
      answer,
      sortOrder,
      isPublished,
    },
    admin.userId,
    admin.email
  );

  revalidatePath("/", "layout");
  return { success: true, message: "FAQ saved." };
}

export async function deleteFaqAction(id: string) {
  const admin = await requireAdmin();
  await deleteFaq(id, admin.userId, admin.email);
  revalidatePath("/", "layout");
  return { success: true };
}
