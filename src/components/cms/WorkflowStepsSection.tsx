import React from "react";
import { PageSection } from "../../lib/types/cms";

interface WorkflowStepsSectionProps {
  section: PageSection;
}

export function WorkflowStepsSection({ section }: WorkflowStepsSectionProps) {
  const content = section.content || {};
  const steps: Array<{ stepNumber: string; title: string; description: string }> =
    content.steps || [];

  return (
    <section className="py-16 sm:py-20 bg-[#F7F8FA] border-b border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] mb-4">
            {section.title || "The Systematic Review Workflow"}
          </h2>
          {section.subtitle && (
            <p className="text-base text-[#667085] leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-5 flex flex-col justify-between relative shadow-sm"
            >
              <div>
                <span className="text-xs font-bold text-[#2F7D78] uppercase tracking-wider block mb-2">
                  {step.stepNumber}
                </span>
                <h3 className="text-sm font-semibold text-[#17212B] mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
