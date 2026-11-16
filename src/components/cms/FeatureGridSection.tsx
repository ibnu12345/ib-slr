import React from "react";
import {
  FileText,
  UploadCloud,
  Users,
  Sparkles,
  ShieldCheck,
  GitBranch,
  Database,
  CopyCheck,
  Eye,
  FileSearch,
  CheckCircle,
  Table,
  Shield,
  Share2,
  LucideIcon,
} from "lucide-react";
import { PageSection } from "../../lib/types/cms";

interface FeatureGridSectionProps {
  section: PageSection;
}

const iconMap: Record<string, LucideIcon> = {
  FileText,
  UploadCloud,
  Users,
  Sparkles,
  ShieldCheck,
  GitBranch,
  Database,
  CopyCheck,
  Eye,
  FileSearch,
  CheckCircle,
  Table,
  Shield,
  Share2,
};

export function FeatureGridSection({ section }: FeatureGridSectionProps) {
  const content = section.content || {};
  const features: Array<{ title: string; description: string; icon?: string }> =
    content.features || [];

  return (
    <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] mb-4">
            {section.title || "Built for Methodological Rigor"}
          </h2>
          {section.subtitle && (
            <p className="text-base text-[#667085] leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = (feature.icon && iconMap[feature.icon]) || Sparkles;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#E4E7EC] rounded-xl p-6 hover:border-[#2F7D78]/50 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#17212B] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
