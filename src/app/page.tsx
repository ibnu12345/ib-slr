import { getPageBySlug, getFaqs, getPricingPlans, getTestimonials } from "../lib/db";
import { DynamicPageRenderer } from "../components/cms/DynamicPageRenderer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [page, faqs, pricingPlans, testimonials] = await Promise.all([
    getPageBySlug("/"),
    getFaqs(),
    getPricingPlans(),
    getTestimonials(),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <div className="w-full">
      <DynamicPageRenderer
        page={page}
        faqs={faqs}
        pricingPlans={pricingPlans}
        testimonials={testimonials}
      />
    </div>
  );
}
