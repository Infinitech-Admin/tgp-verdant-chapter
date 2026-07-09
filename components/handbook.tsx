"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Shield,
  ChevronRight,
  Scroll,
  CheckCircle2,
} from "lucide-react";

const tenets = [
  {
    number: "I",
    title: "Supreme Fraternity",
    content:
      "The Tau Gamma Phi is the Triskelion Grand Fraternity. My fraternity, the supreme fraternity.",
    highlight: "Triskelion Grand Fraternity",
  },
  {
    number: "II",
    title: "Primum Nil Nocere",
    latin: "First, do not harm",
    content:
      "Let alone in defense of oneself; For whatever cause man has come into being, for whatever reason he exists to wherever he is destined. Keen to all living creatures around him. Man is brother unto man.",
    highlight: "Man is brother unto man",
  },
  {
    number: "III",
    title: "De Gustibus Non Disputandum Est",
    latin: "Of likes and dislikes, there should be no disputing",
    content: "Live and let live.",
    highlight: "Live and let live",
  },
  {
    number: "IV",
    title: "Self-Preservation",
    content: "Preserve yourself, Brain, brawn and blood.",
    highlight: "Brain, brawn and blood",
  },
  {
    number: "V",
    title: "Brotherhood & Sisterhood",
    content:
      "Brothers and Sisters, I shall love and respect. Their counsel I shall heed.",
    highlight: "Love and respect",
  },
  {
    number: "VI",
    title: "Verdant chapter is my alma mater",
    content:
      "The University of Perpetual Help System – Dalta – Las Piñas is my alma matter, to love, to cherish and to honor, its rules and regulations be governed and guided",
    highlight: "UPHSD - Las Piñas",
  },
  {
    number: "VII",
    title: "Grand Triskelion",
    content:
      "The Grand Triskelion is righteous, just and strong. He shall be obeyed.",
    highlight: "Righteous, just and strong",
  },
  {
    number: "VIII",
    title: "Unity",
    content: "A triskelion is brother unto his fellow triskelion.",
    highlight: "Brother unto brother",
  },
];

const codesOfConduct = [
  {
    letter: "T",
    word: "TREAT",
    principle: "Golden Rule",
    content: "Treat others as you would like them to treat you.",
  },
  {
    letter: "R",
    word: "RISE",
    principle: "Honor & Defense",
    content:
      "Rise to defend the name and honor of the fraternity whenever it is unjustly criticized.",
  },
  {
    letter: "I",
    word: "INFORM",
    principle: "Communication",
    content:
      "Inform and orient your fellow brothers and sisters in every matter, which you consider vital to the fraternity",
  },
  {
    letter: "S",
    word: "SALUTE",
    principle: "Respect",
    content:
      "Salute and address your fellow brothers and sisters in a proper manner.",
  },
  {
    letter: "K",
    word: "KEEP",
    principle: "Decorum",
    content:
      "Keep decorum in all fraternity meetings, and act accordingly inside and outside of the fraternity.",
  },
  {
    letter: "E",
    word: "EXCEL",
    principle: "Excellence",
    content: "Excel in your chosen fields of interest and endeavor.",
  },
  {
    letter: "L",
    word: "LIVE",
    principle: "Moderation",
    content:
      "Live a life of moderation. Avoid gluttony, drunkenness and other vices, lest you forget God, Family, Health, Work/Studies, and Fraternity.",
  },
  {
    letter: "I",
    word: "INTEGRITY",
    principle: "Mindful Speech",
    content:
      "In your everyday life, take care of what you say or write. Avoid misinterpretation and lasting misunderstanding.",
  },
  {
    letter: "O",
    word: "OBEY",
    principle: "Discipline",
    content:
      "Obey all fraternity rules and regulations. Be guided in your daily ventures by the Tenets and Codes of Conduct of the fraternity.",
  },
  {
    letter: "N",
    word: "NEVER",
    principle: "Confidentiality",
    content:
      "Never reveal to anyone, not to your friends nor to your family the concerns of the fraternity.",
  },
];

export default function DigitalHandbook() {
  const [activeTab, setActiveTab] = useState<"tenets" | "codes">("tenets");
  const [selectedTenet, setSelectedTenet] = useState<number | null>(null);

  return (
    <section
      id="handbook"
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#f2faf2]"
    >
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f5e8] border border-[#c8e6c8] mb-6">
            <Scroll className="w-4 h-4 text-[#1a4d1a]" />
            <span className="text-sm font-semibold text-[#1a4d1a]">
              DIGITAL HANDBOOK
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 text-[#1a2e1a]">
            Tau Gamma Phi
          </h1>

          <p className="text-xl text-[#6b8f6b] max-w-2xl mx-auto mb-8">
            The sacred principles that define our brotherhood and guide our path
          </p>

          {/* Tab Navigation */}
          <div className="inline-flex p-1 bg-white rounded-2xl shadow-lg border border-[#d0e8d0]">
            <button
              onClick={() => setActiveTab("tenets")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "tenets"
                  ? "bg-[#1a4d1a] text-white shadow-lg"
                  : "text-[#6b8f6b] hover:text-[#1a2e1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Tenets</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("codes")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "codes"
                  ? "bg-[#1a4d1a] text-white shadow-lg"
                  : "text-[#6b8f6b] hover:text-[#1a2e1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Codes of Conduct</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "tenets" ? (
            <motion.div
              key="tenets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tenets Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg border border-[#d0e8d0] mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#1a4d1a] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#d4a017]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-[#b8870c] font-medium">
                      CHAPTER I
                    </div>
                    <div className="text-lg font-bold text-[#1a2e1a]">
                      Tenets of the Fraternity
                    </div>
                  </div>
                </div>
                <p className="text-[#6b8f6b] max-w-2xl mx-auto">
                  Eight fundamental principles that form the foundation of our
                  brotherhood
                </p>
              </div>

              {/* Tenets Grid */}
              <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {tenets.map((tenet, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() =>
                      setSelectedTenet(selectedTenet === index ? null : index)
                    }
                    className="group cursor-pointer"
                  >
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#d0e8d0] hover:border-[#2d7a2d]">
                      {/* Number Badge */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a4d1a]/5 rounded-bl-full" />
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-[#1a4d1a] border-2 border-[#d4a017] flex items-center justify-center shadow-lg">
                        <span className="text-[#d4a017] font-bold text-xl">
                          {tenet.number}
                        </span>
                      </div>

                      <div className="p-8">
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-[#1a2e1a] mb-2 pr-16">
                          {tenet.title}
                        </h3>

                        {/* Latin phrase if exists */}
                        {tenet.latin && (
                          <p className="text-sm italic text-[#1a4d1a] mb-4">
                            "{tenet.latin}"
                          </p>
                        )}

                        {/* Content */}
                        <p className="text-[#3d5c3d] leading-relaxed mb-4">
                          {tenet.content}
                        </p>

                        {/* Highlight */}
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-[#1a4d1a] flex-shrink-0" />
                          <span className="font-semibold text-[#1a4d1a]">
                            {tenet.highlight}
                          </span>
                        </div>
                      </div>

                      {/* Hover indicator */}
                      <div className="h-1 bg-[#1a4d1a] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="codes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Codes Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg border border-[#d0e8d0] mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#1a4d1a] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#d4a017]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-[#b8870c] font-medium">
                      CHAPTER II
                    </div>
                    <div className="text-lg font-bold text-[#1a2e1a]">
                      Codes of Conduct
                    </div>
                  </div>
                </div>
                <p className="text-[#6b8f6b] max-w-2xl mx-auto mb-6">
                  Live the TRISKELION way through these ten principles
                </p>

                {/* TRISKELION Letters */}
                <div className="flex justify-center gap-3 flex-wrap mb-8">
                  {["T", "R", "I", "S", "K", "E", "L", "I", "O", "N"].map(
                    (letter, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="w-12 h-12 rounded-lg bg-[#1a4d1a] border-2 border-[#d4a017] flex items-center justify-center shadow-lg"
                      >
                        <span className="text-[#d4a017] font-bold text-xl">
                          {letter}
                        </span>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>

              {/* Codes List */}
              <div className="max-w-4xl mx-auto space-y-4">
                {codesOfConduct.map((code, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 8 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#d0e8d0]"
                  >
                    <div className="flex items-stretch">
                      {/* Letter Badge */}
                      <div className="w-24 flex-shrink-0 bg-[#1a4d1a] flex flex-col items-center justify-center text-[#d4a017]">
                        <span className="text-4xl font-black">
                          {code.letter}
                        </span>
                        <div className="w-8 h-0.5 bg-[#d4a017]/50 my-2" />
                        <span className="text-xs font-semibold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-[#1a2e1a]">
                              {code.word}
                            </h3>
                            <p className="text-sm text-[#b8870c] font-medium">
                              {code.principle}
                            </p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-[#6b8f6b]" />
                        </div>
                        <p className="text-[#3d5c3d] leading-relaxed">
                          {code.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto mt-20 text-center"
      >
        <div className="bg-[#1a4d1a] rounded-3xl p-12 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="text-6xl mb-4 text-[#d4a017]">"</div>
          <p className="text-2xl font-bold mb-6">
            These principles are not just words—they are the heartbeat of our
            brotherhood.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm font-semibold text-[#a8d4a8]">
            <span>BROTHERHOOD</span>
            <span>•</span>
            <span>HONOR</span>
            <span>•</span>
            <span>EXCELLENCE</span>
          </div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
