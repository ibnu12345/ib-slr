import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/auth/session";
import {
  Shield,
  FileEdit,
  Menu,
  Settings,
  HelpCircle,
  FileText,
  History,
  LayoutDashboard,
  ExternalLink,
  Activity,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  // Strict server-side role check: standard users cannot access /admin
  if (session.role !== "admin" && session.role !== "super_admin") {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#17324D] text-white shrink-0 flex flex-col justify-between border-r border-[#244A70]">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-[#244A70] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm shrink-0 border border-white/20">
                <img
                  src="/logo-icon.png"
                  alt="IB-SLR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight block text-white">
                  IB-SLR Admin CMS
                </span>
                <span className="text-[10px] text-gray-300 block">
                  {session.role.toUpperCase()} • {session.fullName}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-[#244A70] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#3E9C96]" />
              <span>CMS Overview</span>
            </Link>

            <Link
              href="/admin/content/pages"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-[#244A70] transition-colors"
            >
              <FileEdit className="w-4 h-4 text-[#3E9C96]" />
              <span>Pages & Sections</span>
            </Link>

            <Link
              href="/admin/content/navigation"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-[#244A70] transition-colors"
            >
              <Menu className="w-4 h-4 text-[#3E9C96]" />
              <span>Navigation Menus</span>
            </Link>

            <Link
              href="/admin/content/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-[#244A70] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#3E9C96]" />
              <span>Brand & Site Settings</span>
            </Link>

            <Link
              href="/admin/content/faq"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-[#244A70] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[#3E9C96]" />
              <span>FAQ Management</span>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-[#244A70] transition-colors"
            >
              <History className="w-4 h-4 text-[#3E9C96]" />
              <span>Audit & Revision Logs</span>
            </Link>

            <Link
              href="/admin/operations"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-[#244A70] transition-colors"
            >
              <Activity className="w-4 h-4 text-[#3E9C96]" />
              <span>SaaS Operations & Health</span>
            </Link>
          </nav>
        </div>

        {/* Footer shortcuts */}
        <div className="p-4 border-t border-[#244A70] space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-gray-300 hover:text-white px-2 py-1.5 rounded transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/app"
            className="flex items-center justify-between text-gray-300 hover:text-white px-2 py-1.5 rounded transition-colors"
          >
            <span>Research Workspace</span>
            <LayoutDashboard className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Admin Content Canvas */}
      <div className="flex-1 overflow-auto p-6 sm:p-10">
        {children}
      </div>
    </div>
  );
}
