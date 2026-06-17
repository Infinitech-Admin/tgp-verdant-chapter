"use client"

import PageLayout from "@/components/page-layout"
import DigitalHandbook from "@/components/handbook"
// import CTASection from "@/components/cta-section"

export default function AboutPage() {
  return (
    <PageLayout
      title="About Perpetual- Las Piñas Chapter"
      subtitle="Explore our story and the mission behind what we do"
      image="/perps_Field.jpg"
    >
      <DigitalHandbook />
      {/* <CTASection /> */}
    </PageLayout>
  )
}
