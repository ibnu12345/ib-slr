import React from "react";
import { CMSPage, FAQItem, PricingPlan, TestimonialItem } from "../../lib/types/cms";
import { HeroSection } from "./HeroSection";
import { FeatureGridSection } from "./FeatureGridSection";
import { WorkflowStepsSection } from "./WorkflowStepsSection";
import { MetricsDisplaySection } from "./MetricsDisplaySection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";
import { RichTextSection } from "./RichTextSection";
import { CtaBannerSection } from "./CtaBannerSection";

interface DynamicPageRendererProps {
  page: CMSPage;
  faqs?: FAQItem[];
  pricingPlans?: PricingPlan[];
  testimonials?: TestimonialItem[];
}

export function DynamicPageRenderer({
  page,
  faqs = [],
  pricingPlans = [],
  testimonials = [],
}: DynamicPageRendererProps) {
  const sortedSections = [...page.sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="w-full">
      {sortedSections.map((section) => {
        switch (section.sectionType) {
          case "hero":
            return <HeroSection key={section.id} section={section} />;
          case "feature_grid":
            return <FeatureGridSection key={section.id} section={section} />;
          case "workflow_steps":
            return <WorkflowStepsSection key={section.id} section={section} />;
          case "metrics_display":
            return <MetricsDisplaySection key={section.id} section={section} />;
          case "testimonials":
            return (
              <TestimonialsSection
                key={section.id}
                section={section}
                testimonials={testimonials}
              />
            );
          case "pricing_table":
            return (
              <PricingSection
                key={section.id}
                section={section}
                plans={pricingPlans}
              />
            );
          case "faq_accordion":
            return <FAQSection key={section.id} section={section} faqs={faqs} />;
          case "rich_text":
            return <RichTextSection key={section.id} section={section} />;
          case "cta_banner":
            return <CtaBannerSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
