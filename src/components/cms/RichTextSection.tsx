import React from "react";
import { PageSection } from "../../lib/types/cms";

interface RichTextSectionProps {
  section: PageSection;
}

export function RichTextSection({ section }: RichTextSectionProps) {
  const content = section.content || {};
  const bodyText = content.body || "";

  // Split into paragraphs / headings safely without executing raw script/HTML tags
  const paragraphs = bodyText.split("\n\n").filter(Boolean);

  return (
    <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#E4E7EC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {(section.title || section.subtitle) && (
          <div className="mb-10 pb-6 border-b border-[#E4E7EC]">
            {section.title && (
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] mb-3">
                {section.title}
              </h2>
            )}
            {section.subtitle && (
              <p className="text-sm text-[#667085]">{section.subtitle}</p>
            )}
          </div>
        )}

        <div className="prose prose-slate max-w-none space-y-4 text-sm sm:text-base text-[#17212B] leading-relaxed">
          {paragraphs.map((p: string, idx: number) => {
            const trimmed = p.trim();
            if (trimmed.startsWith("### ")) {
              return (
                <h3 key={idx} className="text-lg font-bold text-[#17324D] pt-4">
                  {trimmed.replace(/^###\s+/, "")}
                </h3>
              );
            }
            if (trimmed.startsWith("#### ")) {
              return (
                <h4 key={idx} className="text-base font-semibold text-[#17324D] pt-2">
                  {trimmed.replace(/^####\s+/, "")}
                </h4>
              );
            }
            if (trimmed.startsWith("- ")) {
              const items = trimmed.split("\n").map((line: string) => line.replace(/^-\s+/, ""));
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#17212B]">
                  {items.map((it: string, iIdx: number) => (
                    <li key={iIdx}>{it}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
