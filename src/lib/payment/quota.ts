import { getUserPaymentOrders, getProjects, getUserById } from "../db";
import { UserQuotaInfo } from "../types/payment";

/**
 * Calculate user's active plan, project pass quota, usage, and remaining balance.
 */
export async function getUserQuotaInfo(userId: string, role?: string): Promise<UserQuotaInfo> {
  const isAdmin = role === "admin" || role === "super_admin";
  const user = await getUserById(userId);
  const userEmail = user?.email?.toLowerCase() || "";

  const isOwnerOrPro =
    isAdmin ||
    userId === "usr-pro-vip" ||
    userId === "usr-admin-owner" ||
    userId === "usr-ibnu-owner" ||
    role === "pro" ||
    userEmail.includes("ibnusetiawan1928") ||
    userEmail === "pro@ib-slr.com" ||
    userEmail === "admin@ib-slr.com";

  const orders = await getUserPaymentOrders(userId);
  const paidPasses = orders.filter((o) => o.status === "paid" && o.itemType === "project_pass");
  const purchasedQuota = paidPasses.length;
  const baseFreeQuota = 1;

  const totalQuota = isOwnerOrPro ? 9999 : baseFreeQuota + purchasedQuota;

  const userProjects = await getProjects(userId);
  const activeProjects = userProjects.filter((p) => p.status === "active");
  const usedQuota = activeProjects.length;

  const remainingQuota = isOwnerOrPro ? 9999 : Math.max(0, totalQuota - usedQuota);
  const canCreateNewProject = isOwnerOrPro || totalQuota > usedQuota;

  let planName = "Academic Free";
  let planBadge = "Free Tier (1 Proyek)";

  if (isAdmin) {
    planName = "Enterprise Administrator";
    planBadge = "Akses Super Admin (Tak Terbatas)";
  } else if (isOwnerOrPro) {
    planName = "Pro Lifetime VIP (Owner Pass)";
    planBadge = "Akses Riset Penuh (Gratis)";
  } else if (purchasedQuota > 0) {
    planName = "Pay-Per-Project Pass";
    planBadge = `+${purchasedQuota} Slot Aktif Ekstra`;
  }

  return {
    userId,
    planName,
    planBadge,
    baseFreeQuota,
    purchasedQuota,
    totalQuota,
    usedQuota,
    remainingQuota,
    canCreateNewProject,
    isAdmin: isOwnerOrPro,
    paidOrdersCount: isOwnerOrPro ? 99 : paidPasses.length,
  };
}
