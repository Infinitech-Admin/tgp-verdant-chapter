"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Home, Leaf, Award, Target, Globe, Loader2 } from "lucide-react";

interface CommunityItem {
  community_list: string;
  community_card_icon: string;
  community_card_number: string;
  community_card_category: string;
}

interface CommunityData {
  community_header: string;
  community_title: string;
  community_content: string;
  community_list: string[];
  community_card_icon: string[];
  community_card_number: string[];
  community_card_category: string[];
}

interface ObjectiveData {
  objectives_header: string;
  objectives_title: string;
  objectives_description: string;
  objectives_card_title: string[];
  objectives_card_content: string[];
}

interface MissionVisionData {
  mission_and_vision_header: string;
  mission_and_vision_title: string;
  mission_and_vision_description: string;
  mission_content: string;
  vision_content: string;
}

interface GoalsData {
  goals_header: string;
  goals_title: string;
  goals_description: string;
  goals_content: string;
  goals_card_icon: string[];
  goals_card_title: string[];
  goals_card_content: string[];
  goals_card_list: string[];
}

export default function AboutSection() {
  const [communityData, setCommunityData] = useState<CommunityData | null>(
    null,
  );
  const [objectivesData, setObjectivesData] = useState<ObjectiveData | null>(
    null,
  );
  const [missionVisionData, setMissionVisionData] =
    useState<MissionVisionData | null>(null);
  const [goalsData, setGoalsData] = useState<GoalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [communityRes, objectivesRes, missionVisionRes, goalsRes] =
        await Promise.all([
          fetch("/api/our-community"),
          fetch("/api/objectives"),
          fetch("/api/mission-and-vision"),
          fetch("/api/goals"),
        ]);

      if (communityRes.ok) {
        const communityJson = await communityRes.json();
        if (communityJson.success && communityJson.data) {
          const data = communityJson.data;

          let lists = data.community_list || [];
          let icons = data.community_card_icon || [];
          let numbers = data.community_card_number || [];
          let categories = data.community_card_category || [];

          if (typeof lists === "string") {
            try {
              lists = JSON.parse(lists);
            } catch (e) {
              lists = [];
            }
          }
          if (typeof icons === "string") {
            try {
              icons = JSON.parse(icons);
            } catch (e) {
              icons = [];
            }
          }
          if (typeof numbers === "string") {
            try {
              numbers = JSON.parse(numbers);
            } catch (e) {
              numbers = [];
            }
          }
          if (typeof categories === "string") {
            try {
              categories = JSON.parse(categories);
            } catch (e) {
              categories = [];
            }
          }

          if (!Array.isArray(lists)) lists = [];
          if (!Array.isArray(icons)) icons = [];
          if (!Array.isArray(numbers)) numbers = [];
          if (!Array.isArray(categories)) categories = [];

          setCommunityData({
            community_header: data.community_header || "",
            community_title: data.community_title || "",
            community_content: data.community_content || "",
            community_list: lists,
            community_card_icon: icons,
            community_card_number: numbers,
            community_card_category: categories,
          });
        }
      }

      if (objectivesRes.ok) {
        const objectivesJson = await objectivesRes.json();
        if (objectivesJson.success && objectivesJson.data) {
          const data = objectivesJson.data;

          let titles = data.objectives_card_title || [];
          let contents = data.objectives_card_content || [];

          if (typeof titles === "string") {
            try {
              titles = JSON.parse(titles);
            } catch (e) {
              titles = [];
            }
          }
          if (typeof contents === "string") {
            try {
              contents = JSON.parse(contents);
            } catch (e) {
              contents = [];
            }
          }

          if (!Array.isArray(titles)) titles = [];
          if (!Array.isArray(contents)) contents = [];

          setObjectivesData({
            objectives_header: data.objectives_header || "",
            objectives_title: data.objectives_title || "",
            objectives_description: data.objectives_description || "",
            objectives_card_title: titles,
            objectives_card_content: contents,
          });
        }
      }

      if (missionVisionRes.ok) {
        const missionVisionJson = await missionVisionRes.json();
        if (missionVisionJson.success && missionVisionJson.data) {
          setMissionVisionData(missionVisionJson.data);
        }
      }

      if (goalsRes.ok) {
        const goalsJson = await goalsRes.json();
        if (goalsJson.success && goalsJson.data) {
          const data = goalsJson.data;

          let icons = data.goals_card_icon || [];
          let titles = data.goals_card_title || [];
          let contents = data.goals_card_content || [];
          let lists = data.goals_card_list || [];

          if (typeof icons === "string") {
            try {
              icons = JSON.parse(icons);
            } catch (e) {
              icons = [];
            }
          }
          if (typeof titles === "string") {
            try {
              titles = JSON.parse(titles);
            } catch (e) {
              titles = [];
            }
          }
          if (typeof contents === "string") {
            try {
              contents = JSON.parse(contents);
            } catch (e) {
              contents = [];
            }
          }
          if (typeof lists === "string") {
            try {
              lists = JSON.parse(lists);
            } catch (e) {
              lists = [];
            }
          }

          if (!Array.isArray(icons)) icons = [];
          if (!Array.isArray(titles)) titles = [];
          if (!Array.isArray(contents)) contents = [];
          if (!Array.isArray(lists)) lists = [];

          setGoalsData({
            goals_header: data.goals_header || "",
            goals_title: data.goals_title || "",
            goals_description: data.goals_description || "",
            goals_content: data.goals_content || "",
            goals_card_icon: icons,
            goals_card_title: titles,
            goals_card_content: contents,
            goals_card_list: lists,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section
        id="about"
        className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#f2faf2]" />
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#1a4d1a] mx-auto mb-4" />
            <p className="text-[#6b8f6b]">Loading content...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="about"
      className="mb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#f2faf2]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Community Section */}
        {communityData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24 mb-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs tracking-widest uppercase text-[#b8870c] font-semibold">
                  {communityData.community_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
                {communityData.community_title}
              </h2>

              {communityData.community_content && (
                <p className="text-lg text-[#6b8f6b] max-w-3xl mx-auto">
                  {communityData.community_content}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {Array.isArray(communityData.community_list) &&
                communityData.community_list.map((item, index) => {
                  const iconMap: { [key: string]: React.ReactNode } = {
                    Users: <Users className="w-6 h-6" />,
                    Home: <Home className="w-6 h-6" />,
                    Leaf: <Leaf className="w-6 h-6" />,
                    Award: <Award className="w-6 h-6" />,
                    Target: <Target className="w-6 h-6" />,
                    Globe: <Globe className="w-6 h-6" />,
                  };

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all border border-[#d0e8d0] hover:border-[#2d7a2d]"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#1a4d1a] border-2 border-[#d4a017] flex items-center justify-center mx-auto mb-3 text-[#d4a017]">
                        {iconMap[communityData.community_card_icon[index]] || (
                          <Users className="w-6 h-6" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-center text-[#1a2e1a] mb-2">
                        {item}
                      </h3>
                      <div className="text-2xl font-bold text-center text-[#1a4d1a] mb-1">
                        {communityData.community_card_number[index]}
                      </div>
                      <p className="text-xs text-center text-[#6b8f6b]">
                        {communityData.community_card_category[index]}
                      </p>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Goals Section */}
        {goalsData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24 mb-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs tracking-widest uppercase text-[#b8870c] font-semibold">
                  {goalsData.goals_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
                {goalsData.goals_title}
              </h2>

              {goalsData.goals_description && (
                <p className="text-lg text-[#6b8f6b] max-w-3xl mx-auto mb-4">
                  {goalsData.goals_description}
                </p>
              )}

              {goalsData.goals_content && (
                <p className="text-lg text-[#6b8f6b] max-w-3xl mx-auto">
                  {goalsData.goals_content}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {Array.isArray(goalsData.goals_card_title) &&
                goalsData.goals_card_title.map((title, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all border border-[#d0e8d0] hover:border-[#2d7a2d] group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#1a4d1a] border-2 border-[#d4a017] flex items-center justify-center mb-4 text-[#d4a017] group-hover:scale-110 transition-transform shadow-sm">
                      <span className="text-xl font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#1a2e1a]">
                      {title}
                    </h3>
                    <p className="text-[#6b8f6b] leading-relaxed mb-3">
                      {goalsData.goals_card_content[index]}
                    </p>
                    {goalsData.goals_card_list &&
                      goalsData.goals_card_list[index] && (
                        <ul className="space-y-2 text-sm text-[#6b8f6b]">
                          <li className="flex items-center gap-2">
                            <span className="text-[#1a4d1a] font-bold">•</span>
                            {goalsData.goals_card_list[index]}
                          </li>
                        </ul>
                      )}
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Mission & Vision Section */}
        {missionVisionData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24 mb-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs tracking-widest uppercase text-[#b8870c] font-semibold">
                  {missionVisionData.mission_and_vision_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
                {missionVisionData.mission_and_vision_title}
              </h2>

              {missionVisionData.mission_and_vision_description && (
                <p className="text-lg text-[#6b8f6b] max-w-3xl mx-auto">
                  {missionVisionData.mission_and_vision_description}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all border border-[#d0e8d0] hover:border-[#2d7a2d]"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-[#1a4d1a] border-2 border-[#d4a017] flex items-center justify-center shadow-sm">
                    <Target className="w-8 h-8 text-[#d4a017]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a2e1a]">Mission</h3>
                </div>
                <p className="text-[#6b8f6b] leading-relaxed">
                  {missionVisionData.mission_content}
                </p>
              </motion.div>

              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all border border-[#d0e8d0] hover:border-[#2d7a2d]"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-[#1a4d1a] border-2 border-[#d4a017] flex items-center justify-center shadow-sm">
                    <Globe className="w-8 h-8 text-[#d4a017]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a2e1a]">Vision</h3>
                </div>
                <p className="text-[#6b8f6b] leading-relaxed">
                  {missionVisionData.vision_content}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Objectives Section */}
        {objectivesData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs tracking-widest uppercase text-[#b8870c] font-semibold">
                  {objectivesData.objectives_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a2e1a]">
                {objectivesData.objectives_title}
              </h2>

              <p className="text-lg text-[#6b8f6b] max-w-3xl mx-auto">
                {objectivesData.objectives_description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {Array.isArray(objectivesData.objectives_card_title) &&
                objectivesData.objectives_card_title.map((title, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 8, scale: 1.02 }}
                    className="relative p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-[#1a4d1a] group"
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-[#1a4d1a] border-2 border-[#d4a017] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <span className="text-[#d4a017] font-bold text-xl">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 text-[#1a2e1a]">
                          {title}
                        </h3>
                        <p className="text-[#6b8f6b] leading-relaxed">
                          {objectivesData.objectives_card_content[index]}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#2d7a2d]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#d4a017]/10 rounded-full blur-3xl" />
    </section>
  );
}
