import React from "react";
import { AdSenseBanner } from "../ads/AdSenseBanner";
import { Info, Check } from "lucide-react";

interface ArticleContentRendererProps {
  content: string;
  adsenseClientId?: string;
  adsenseSlotId?: string;
}

export function ArticleContentRenderer({
  content,
  adsenseClientId = "ca-pub-4685484644548395",
  adsenseSlotId = "1234567890",
}: ArticleContentRendererProps) {
  // Split content into blocks separated by two or more newlines
  const rawBlocks = content.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  // We will insert a contextual AdSense banner halfway through the article
  const midPoint = Math.floor(rawBlocks.length / 2);

  // Helper to render inline formatting: bold (**text**), code (`text`), and italic (*text*)
  const renderFormattedText = (text: string) => {
    // Process markdown inline tokens
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-[#17324D]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-[#F2F4F7] text-[#17324D] font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        return <em key={i} className="italic text-[#344054]">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 text-[#344054] text-base leading-relaxed">
      {rawBlocks.map((block, index) => {
        // Horizontal Rule
        if (block === "---") {
          return <hr key={index} className="border-t border-[#E4E7EC] my-8" />;
        }

        // Heading 2
        if (block.startsWith("## ")) {
          const title = block.replace(/^##\s+/, "");
          const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <h2
              key={index}
              id={id}
              className="text-2xl sm:text-3xl font-extrabold text-[#17324D] tracking-tight pt-6 pb-2 border-b border-[#F2F4F7]"
            >
              {title}
            </h2>
          );
        }

        // Heading 3
        if (block.startsWith("### ")) {
          const title = block.replace(/^###\s+/, "");
          return (
            <h3
              key={index}
              className="text-lg sm:text-xl font-bold text-[#17324D] tracking-tight pt-4"
            >
              {title}
            </h3>
          );
        }

        // Blockquote / Callout
        if (block.startsWith("> ")) {
          const calloutText = block.replace(/^>\s+/gm, "");
          return (
            <div
              key={index}
              className="my-6 p-4 sm:p-5 rounded-xl bg-[#EFF7F6] border-l-4 border-[#2F7D78] text-sm text-[#17324D] flex items-start gap-3.5 shadow-2xs"
            >
              <Info className="w-5 h-5 text-[#2F7D78] shrink-0 mt-0.5" />
              <div className="leading-relaxed">{renderFormattedText(calloutText)}</div>
            </div>
          );
        }

        // Code / Preformatted Block
        if (block.startsWith("```")) {
          const cleanCode = block.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
          return (
            <div key={index} className="my-6 rounded-xl overflow-hidden border border-[#E4E7EC] bg-[#17212B] text-gray-100 shadow-sm">
              <div className="px-4 py-2 bg-[#0F172A] border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>Code / Syntax Strategy</span>
              </div>
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-normal text-emerald-400">
                <code>{cleanCode}</code>
              </pre>
            </div>
          );
        }

        // Table
        if (block.includes("|") && block.includes("---")) {
          const rows = block.split("\n").filter((r) => r.trim().startsWith("|"));
          if (rows.length >= 2) {
            const headerCells = rows[0]
              .split("|")
              .slice(1, -1)
              .map((c) => c.trim());
            const bodyRows = rows.slice(2).map((r) =>
              r
                .split("|")
                .slice(1, -1)
                .map((c) => c.trim())
            );

            return (
              <div key={index} className="my-6 overflow-x-auto rounded-xl border border-[#E4E7EC] shadow-2xs">
                <table className="min-w-full divide-y divide-[#E4E7EC] text-left text-xs sm:text-sm">
                  <thead className="bg-[#F8F9FA]">
                    <tr>
                      {headerCells.map((header, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-4 py-3 font-semibold text-[#17324D] uppercase tracking-wider text-[11px]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7] bg-white">
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-[#344054] leading-relaxed align-top">
                            {renderFormattedText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Bullet List
        if (block.startsWith("- ") || block.startsWith("* ")) {
          const listItems = block.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
          return (
            <ul key={index} className="my-4 space-y-2.5 pl-2">
              {listItems.map((item, lIdx) => {
                const itemText = item.replace(/^[-*]\s+/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#344054]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D78] mt-2 shrink-0" />
                    <span>{renderFormattedText(itemText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered List
        if (/^\d+\.\s/.test(block)) {
          const numItems = block.split("\n").filter((l) => /^\d+\.\s/.test(l.trim()));
          return (
            <ol key={index} className="my-4 space-y-2.5 pl-2">
              {numItems.map((item, nIdx) => {
                const itemText = item.replace(/^\d+\.\s+/, "");
                return (
                  <li key={nIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#344054]">
                    <span className="w-6 h-6 rounded-full bg-[#EFF7F6] text-[#2F7D78] text-xs font-bold flex items-center justify-center shrink-0 border border-[#2F7D78]/20 mt-0.5">
                      {nIdx + 1}
                    </span>
                    <span className="leading-relaxed">{renderFormattedText(itemText)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular Paragraph
        const element = (
          <p key={index} className="text-sm sm:text-base text-[#344054] leading-relaxed">
            {renderFormattedText(block)}
          </p>
        );

        // Inject Mid-Article AdSense Banner right at the midpoint
        if (index === midPoint) {
          return (
            <React.Fragment key={index}>
              {element}
              <div className="my-8 py-4 px-2 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E4E7EC]">
                <AdSenseBanner
                  clientId={adsenseClientId}
                  slotId={adsenseSlotId}
                  format="horizontal"
                  className="my-0"
                />
              </div>
            </React.Fragment>
          );
        }

        return element;
      })}
    </div>
  );
}
