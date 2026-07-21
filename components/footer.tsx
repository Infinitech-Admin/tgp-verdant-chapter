"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  verified: boolean;
}

export default function Footer() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <footer className="bg-[#0f2e0f] text-white relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#2d7a2d]" />

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {/* Main row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔱</span>
              <h3 className="text-lg font-bold text-white">Verdant Chapter</h3>
            </div>
            <p className="text-[#6b8f6b] text-xs max-w-[200px] mb-3 leading-relaxed">
              Tau Gamma Phi · UPHSD Las Piñas
              <br />
              Primum Nil Nocere
            </p>

            <a
              href="https://www.facebook.com/share/g/1ASmUYtddk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#a8d4a8] hover:text-[#d4a017] transition-colors"
            >
              <Facebook className="w-4 h-4" />
              Facebook Page
            </a>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-xs font-semibold text-[#d4a017] uppercase tracking-widest mb-3">
              Navigate
            </h4>
            <div className="flex flex-col gap-1.5">
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "News", path: "/news" },
                { name: "Announcements", path: "/announcements" },
                { name: "Contact", path: "/contact" },
              ].map(({ name, path }) => (
                <Link
                  key={name}
                  href={path}
                  className="text-sm text-[#a8d4a8] hover:text-[#d4a017] transition-colors"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-[#d4a017] uppercase tracking-widest mb-3">
              Contact
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="tel:09244187511"
                className="flex items-center gap-2 text-sm text-[#a8d4a8] hover:text-[#d4a017] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                09244187511
              </a>

              <a
                href="mailto:verdant.triskelion.lp@gmail.com"
                className="flex items-center gap-2 text-sm text-[#a8d4a8] hover:text-[#d4a017] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                verdant.triskelion.lp@gmail.com
              </a>
              <p className="flex items-center gap-2 text-sm text-[#a8d4a8]">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                Las Piñas City, Philippines
              </p>
            </div>
          </div>

          <div className="hidden md:block border-l border-[#1a4d1a] pl-6 max-w-[180px]">
            <p className="text-2xl text-[#d4a017] leading-none mb-2">"</p>
            <p className="text-xs text-[#6b8f6b] leading-relaxed italic">
              Brotherhood · Honor · Excellence
            </p>
            <p className="text-xs text-[#6b8f6b] leading-relaxed italic mt-2">
              Building Leaders.
              <br />
              Shaping Futures.
              <br />
              Serving Communities.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-[#1a4d1a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-green-200">
          <span>
            © {new Date().getFullYear()} Verdant Chapter · Tau Gamma Phi. All
            Rights Reserved.
          </span>
          <span className="text-green-200">
            UPHSD Las Piñas · Pamplona Tres
          </span>
        </div>
      </div>
    </footer>
  );
}
