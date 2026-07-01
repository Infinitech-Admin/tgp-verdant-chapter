"use client";

import PageLayout from "@/components/page-layout";
import AboutSection from "@/components/about-section";
import CTASection from "@/components/cta-section";

export default function AboutPage() {
  return (
    <PageLayout
      title="About Verdan Chapter"
      subtitle="Learn more about our organization, our mission, and our commitment to serving the community"
      image="/perps_Field.jpg"
    >
      <AboutSection />
      <CTASection />
    </PageLayout>
  );
}
