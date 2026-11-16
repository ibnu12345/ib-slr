import React from "react";
import Link from "next/link";
import {
  getAllPages,
  getAllNavigationItems,
  getAllFaqs,
  getAuditLogs,
  getSiteSettings,
} from "../../lib/db";
import {
  FileEdit,
  Menu,
  HelpCircle,
  History,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [pages, navItems, faqs, auditLogs, settings] = await Promise.all([
    getAllPages(),
    getAllNavigationItems(),
    getAllFaqs(),
    getAuditLogs(5),
    getSiteSettings(),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title & Quick Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#EFF7F6] text-[#2F7D78] text-[11px] font-semibold uppercase tracking-wider">
              Content Management System
            </span>
            <span className="text-xs text-[#18794E] flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protected Admin Authority
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D]">
            Admin CMS Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Manage public marketing content, navigation menus, branding, and FAQs in real time without redeploying code.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#17324D] text-white text-xs font-semibold hover:bg-[#12273D] transition-colors shadow-sm"
        >
          <span>Open Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Managed Pages</span>
            <FileEdit className="w-4 h-4 text-[#2F7D78]" />
          </div>
          <div className="text-2xl font-bold text-[#17324D]">{pages.length}</div>
          <div className="text-[11px] text-[#2F7D78] mt-1">All data-driven routes</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Nav Links</span>
            <Menu className="w-4 h-4 text-[#2F7D78]" />
          </div>
          <div className="text-2xl font-bold text-[#17324D]">{navItems.length}</div>
          <div className="text-[11px] text-[#667085] mt-1">Header & footer links</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Published FAQs</span>
            <HelpCircle className="w-4 h-4 text-[#2F7D78]" />
          </div>
          <div className="text-2xl font-bold text-[#17324D]">{faqs.length}</div>
          <div className="text-[11px] text-[#667085] mt-1">Methodology & answers</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Audit Trail</span>
            <History className="w-4 h-4 text-[#2F7D78]" />
          </div>
          <div className="text-2xl font-bold text-[#17324D]">Active</div>
          <div className="text-[11px] text-[#18794E] mt-1">Immutable modification logs</div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/content/pages"
          className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 hover:border-[#2F7D78] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mb-4 group-hover:bg-[#2F7D78] group-hover:text-white transition-colors">
            <FileEdit className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#17324D] mb-1">
            Edit Pages & Sections
          </h2>
          <p className="text-xs text-[#667085] mb-4">
            Update homepage Hero headline, feature cards, workflow steps, pricing copy, and rich text.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7D78]">
            <span>Manage Pages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/content/navigation"
          className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 hover:border-[#2F7D78] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mb-4 group-hover:bg-[#2F7D78] group-hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#17324D] mb-1">
            Navigation Menus
          </h2>
          <p className="text-xs text-[#667085] mb-4">
            Reorder header menu items, add custom links, and update footer resource columns.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7D78]">
            <span>Configure Nav</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/content/settings"
          className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 hover:border-[#2F7D78] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mb-4 group-hover:bg-[#2F7D78] group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#17324D] mb-1">
            Brand & Banner Settings
          </h2>
          <p className="text-xs text-[#667085] mb-4">
            Control the announcement banner, contact email addresses, and global SEO metadata.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7D78]">
            <span>Edit Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Audit Logs Snapshot */}
      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#2F7D78]" />
            <h2 className="text-sm font-bold text-[#17324D]">Recent CMS Activity Log</h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-[#2F7D78] hover:underline"
          >
            View All Logs
          </Link>
        </div>

        <div className="divide-y divide-[#E4E7EC] text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-[#17212B]">{log.action}</span>
                <span className="text-[#667085] ml-2 font-mono">[{log.entityType}]</span>
                <div className="text-[11px] text-[#667085] mt-0.5">
                  By {log.userEmail || "System"} • {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E4E7EC] text-[#667085] font-mono text-[10px]">
                {log.entityId || "global"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
