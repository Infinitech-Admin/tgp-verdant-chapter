"use client";
import PageLayout from "@/components/page-layout";
import AnnouncementsSection from "@/components/announcements-section";
import CTASection from "@/components/cta-section";

export default function AnnouncementsPage() {
  return (
    <PageLayout
      title="Announcements"
      subtitle="Stay informed with the latest updates, events, and activities of Verdant Chapter Las Piñas"
      image="/using-announcements.jpg"
    >
      <AnnouncementsSection />
      <CTASection />
    </PageLayout>
  );
}
