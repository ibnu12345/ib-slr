import React from "react";
import { Quote } from "lucide-react";
import { PageSection, TestimonialItem } from "../../lib/types/cms";

interface TestimonialsSectionProps {
  section: PageSection;
  testimonials?: TestimonialItem[];
}

export function TestimonialsSection({ section, testimonials = [] }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] mb-4">
            {section.title || "Trusted by Evidence Synthesis Teams"}
          </h2>
          {section.subtitle && (
            <p className="text-base text-[#667085] leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl p-6 sm:p-8 flex flex-col justify-between relative shadow-sm"
            >
              <div>
                <Quote className="w-8 h-8 text-[#2F7D78]/30 mb-4" />
                <p className="text-sm text-[#17212B] italic leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-[#E4E7EC]">
                <div className="font-semibold text-sm text-[#17324D]">{t.authorName}</div>
                <div className="text-xs text-[#667085]">{t.authorRole}</div>
                <div className="text-xs text-[#2F7D78] font-medium">{t.institution}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
