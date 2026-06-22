"use client";

import PageLayout from "@/components/page-layout";
import NewsSection from "@/components/news-section";
import CTASection from "@/components/cta-section";

export default function NewsPage() {
  return (
    <PageLayout
      title="News"
      subtitle="Read the latest stories, upcoming events, and community updates"
      image="/news_banner.png"
    >
      <NewsSection />
      <CTASection />
    </PageLayout>
  );
}
