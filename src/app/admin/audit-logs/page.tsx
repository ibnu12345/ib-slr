import React from "react";
import { getAuditLogs } from "../../../lib/db";
import { History, ShieldCheck, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs(200);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            System Audit & Revision Trail
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Immutable log of all administrative content edits, security events, and user registrations.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF3] border border-[#18794E]/25 text-[#18794E] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tamper-Resistant Logging Active</span>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-[#667085] font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#EFF7F6] text-[#2F7D78] border border-[#2F7D78]/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[#17212B]">
                    {log.entityType} ({log.entityId || "global"})
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[#667085]">
                    {log.userEmail || "System"}
                  </td>
                  <td className="py-3 px-4 text-[11px] font-mono text-[#667085] max-w-md truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
