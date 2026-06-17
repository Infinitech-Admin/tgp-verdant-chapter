"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-[#1a4d1a] text-white text-center relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2d7a2d]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a017]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-3xl lg:text-5xl font-bold mb-6 px-5">
          Start Your Journey at Perpetual College
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto text-[#a8d4a8]">
          Excellence, innovation, and holistic education await you.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register">
            <button className="px-10 py-4 bg-white text-[#1a4d1a] font-bold rounded-full hover:bg-[#f2faf2] transition-all hover:scale-105">
              Apply Now
            </button>
          </Link>
          <Link href="/contact">
            <button className="px-10 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition-all hover:scale-105">
              Inquire Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
