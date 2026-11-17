import { getUserPaymentOrders, getProjects } from "../db";
import { UserQuotaInfo } from "../types/payment";

/**
 * Calculate user's active plan, project pass quota, usage, and remaining balance.
 */
export async function getUserQuotaInfo(userId: string, role?: string): Promise<UserQuotaInfo> {
  const isAdmin = role === "admin" || role === "super_admin";
  const orders = await getUserPaymentOrders(userId);
  const paidPasses = orders.filter((o) => o.status === "paid" && o.itemType === "project_pass");
  const purchasedQuota = paidPasses.length;
  const baseFreeQuota = 1;

  const totalQuota = isAdmin ? 9999 : baseFreeQuota + purchasedQuota;

  const userProjects = await getProjects(userId);
  const activeProjects = userProjects.filter((p) => p.status === "active");
  const usedQuota = activeProjects.length;

  const remainingQuota = isAdmin ? 9999 : Math.max(0, totalQuota - usedQuota);
  const canCreateNewProject = isAdmin || totalQuota > usedQuota;

  let planName = "Academic Free";
  let planBadge = "Free Tier (1 Proyek)";

  if (isAdmin) {
    planName = "Enterprise Administrator";
    planBadge = "Akses Tak Terbatas";
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
    isAdmin,
    paidOrdersCount: paidPasses.length,
  };
}
