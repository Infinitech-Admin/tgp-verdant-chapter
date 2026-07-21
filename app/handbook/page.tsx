"use client";

import PageLayout from "@/components/page-layout";
import DigitalHandbook from "@/components/handbook";
// import CTASection from "@/components/cta-section"

export default function AboutPage() {
  return (
    <PageLayout
      title="About Verdant- Las Piñas Chapter"
      subtitle="Explore the guidelines, structure, and values of Verdant Chapter"
      image="/perps_Field.jpg"
    >
      <DigitalHandbook />
      {/* <CTASection /> */}
    </PageLayout>
  );
}
