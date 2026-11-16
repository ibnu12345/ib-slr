import React from "react";
import { getAllFaqs } from "../../../../lib/db";
import { FAQEditor } from "./FAQEditor";

export const dynamic = "force-dynamic";

export default async function AdminFAQPage() {
  const faqs = await getAllFaqs();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#E4E7EC]">
        <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
          FAQ Content Management
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Maintain verified methodology, privacy, and PRISMA 2020 answers for researchers.
        </p>
      </div>

      <FAQEditor initialFaqs={faqs} />
    </div>
  );
}
