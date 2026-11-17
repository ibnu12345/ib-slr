import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCurrentSession } from "../../../../../lib/auth/session";
import { getPaymentOrderById } from "../../../../../lib/db";
import { InvoicePrintView } from "./InvoicePrintView";

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function InvoicePage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  const { orderId } = await params;
  const order = await getPaymentOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Security check: Only allow the owner of the order or admin to view the receipt
  const isOwner = order.userId === session.userId;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isOwner && !isAdmin) {
    redirect("/app");
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("ib_slr_lang")?.value || "en";
  const isId = lang === "id";

  return <InvoicePrintView order={order} isId={isId} />;
}
