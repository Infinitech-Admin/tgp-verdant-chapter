"use client";

import { Compass } from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCommunityPage from "../our-community/page";
import AboutGoalsPage from "../goals/page";
import MissionAndVisionPage from "../mission-and-vision/page";
import ObjectivesPage from "../objectives/page";

export default function AboutUsPage() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f2faf2]">
        {/* Header */}
        <div className="bg-white border-b border-[#d0e8d0] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <div className="p-2 bg-[#e8f5e8] rounded-lg">
              <Compass className="w-6 h-6 text-[#1a4d1a]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a2e1a]">
                About Us Customization
              </h1>
              <p className="text-xs sm:text-sm text-[#6b8f6b] mt-0.5">
                Manage About Us sections
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs defaultValue="community">
            <div className="flex justify-center items-center mb-8">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 lg:max-w-3xl w-full gap-x-1 bg-[#e8f5e8] p-1 rounded-xl">
                {["community", "goals", "mission", "objectives"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="capitalize rounded-lg text-[#3d5c3d] data-[state=active]:bg-[#1a4d1a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="community">
              <AdminCommunityPage />
            </TabsContent>
            <TabsContent value="goals">
              <AboutGoalsPage />
            </TabsContent>
            <TabsContent value="mission">
              <MissionAndVisionPage />
            </TabsContent>
            <TabsContent value="objectives">
              <ObjectivesPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
