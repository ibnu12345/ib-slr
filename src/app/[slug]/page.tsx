import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getFaqs, getPricingPlans, getTestimonials } from "../../lib/db";
import { DynamicPageRenderer } from "../../components/cms/DynamicPageRenderer";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(`/${slug}`);
  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.seoMetadata?.metaTitle || page.title,
    description: page.seoMetadata?.metaDescription || page.description,
  };
}

export default async function CMSPageView({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = `/${slug}`;

  const [page, faqs, pricingPlans, testimonials] = await Promise.all([
    getPageBySlug(normalizedSlug),
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
