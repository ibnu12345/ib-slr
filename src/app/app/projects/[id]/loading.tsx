import React from "react";
import { Loader2 } from "lucide-react";

export default function ProjectPageLoading() {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-200">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-[#EFF7F6] border-t-[#2F7D78] animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-[#17324D]">Memuat Menu Penelitian...</p>
        <p className="text-xs text-[#667085]">Menyiapkan data audit ledger & artikel terkini</p>
      </div>
    </div>
  );
}
