"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Send } from "lucide-react";

interface Message {
  type: "bot" | "user";
  text: string;
  quickReplies?: string[];
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      text: "Hi there! 👋 Welcome to Tau Gamma Phi — Verdant Chapter at Perpetual Help. How can I help you today?",
      quickReplies: ["About Us", "Brotherhood", "Events", "Join TGP"],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const getBotResponse = (
    userMessage: string,
  ): { text: string; quickReplies?: string[] } => {
    const msg = userMessage.toLowerCase();

    if (
      msg.includes("about") ||
      msg.includes("tau gamma") ||
      msg.includes("tgp") ||
      msg.includes("triskelion")
    ) {
      return {
        text: '🔱 **TAU GAMMA PHI — VERDANT CHAPTER**\n\n*Triskelions\' Grand Fraternity*\n\nWe are the Verdant Chapter based at University of Perpetual Help System DALTA - Las Piñas Campus, Pamplona Tres.\n\n**Our Legacy:**\n• Founded: October 4, 1968\n• Symbol: Triskelion (3 legs)\n• Colors: Forest Green, Black, Gold\n• Motto: "Primum Nil Nocere" (First, Do No Harm)\n\n**Core Pillars:**\n• Brotherhood & Loyalty\n• Academic Excellence\n• Community Service\n• Leadership & Character',
        quickReplies: ["Brotherhood", "Activities", "Join TGP", "History"],
      };
    }

    if (
      msg.includes("brother") ||
      msg.includes("member") ||
      msg.includes("values")
    ) {
      return {
        text: "🤝 **BROTHERHOOD & VALUES**\n\n**What We Stand For:**\n• Unity and Camaraderie\n• Mutual Respect & Support\n• Personal Development\n• Social Responsibility\n\n**Our Brothers:**\nWe are students and alumni of UPHSD Las Piñas who believe in the power of brotherhood to create positive change.\n\n**Principles:**\n✓ Academic excellence first\n✓ Respect for all\n✓ Service above self\n✓ Integrity in all things",
        quickReplies: ["Activities", "Join TGP", "Contact"],
      };
    }

    if (
      msg.includes("event") ||
      msg.includes("activity") ||
      msg.includes("what do") ||
      msg.includes("programs")
    ) {
      return {
        text: "📅 **CHAPTER ACTIVITIES & EVENTS**\n\n**Community Service:**\n• Blood Donation Drives\n• Feeding Programs (Pamplona Tres community)\n• Clean-up Drives\n• Outreach to local communities\n\n**Brotherhood Events:**\n• Weekly Brotherhood Meetings\n• Foundation Day Celebration (Oct 4)\n• Sports Tournaments\n• Academic Support Sessions\n\n**Campus Involvement:**\n• Student Government participation\n• University events support\n• Inter-fraternity cooperation",
        quickReplies: ["Join TGP", "Schedule", "Contact"],
      };
    }

    if (
      msg.includes("join") ||
      msg.includes("recruit") ||
      msg.includes("membership") ||
      msg.includes("how to")
    ) {
      return {
        text: '✊ **JOINING TAU GAMMA PHI**\n\n**Interested in Brotherhood?**\n\n**Requirements:**\n• Currently enrolled at UPHSD Las Piñas\n• Good academic standing\n• Good moral character\n• Commitment to our values\n\n**Process:**\n1. Attend our open recruitment events\n2. Meet with chapter officers\n3. Learn about our history & values\n4. Complete orientation program\n\n**Important:**\n• We DO NOT practice hazing\n• We follow strict anti-hazing laws\n• Safe, meaningful brotherhood building\n\n*"Once a Triskelion, Always a Triskelion"*',
        quickReplies: ["Requirements", "Contact", "About Us"],
      };
    }

    if (
      msg.includes("history") ||
      msg.includes("founded") ||
      msg.includes("origin") ||
      msg.includes("started")
    ) {
      return {
        text: '📜 **TAU GAMMA PHI HISTORY**\n\n**National Founding:**\nOctober 4, 1968 - University of the Philippines\n\n**The Triskelion Symbol:**\nThree bent human legs representing:\n• Unity of Action\n• Strength in Numbers\n• Progress through Brotherhood\n\n**Verdant Chapter:**\nEstablished at University of Perpetual Help System DALTA - Las Piñas Campus in Pamplona Tres, serving students and community.\n\n*"Fraternity for a Lifetime"*',
        quickReplies: ["About Us", "Join TGP", "Contact"],
      };
    }

    if (
      msg.includes("contact") ||
      msg.includes("reach") ||
      msg.includes("find") ||
      msg.includes("location")
    ) {
      return {
        text: '📍 **CONTACT — VERDANT CHAPTER**\n\n**Location:**\nUniversity of Perpetual Help System DALTA\nLas Piñas Campus\nC.V. Starr Avenue, Pamplona Tres\nLas Piñas City, Metro Manila\n\n**How to Reach Us:**\n• Visit us at UPHSD Las Piñas Campus\n• Look for Tau Gamma Phi members/officers\n• Attend our campus events and activities\n\n**Social Media:**\nFollow "Tau Gamma Phi Verdant Chapter" on Facebook for updates.\n\n🔱 *Primum Nil Nocere*',
        quickReplies: ["Join TGP", "Events", "About Us"],
      };
    }

    if (
      msg.includes("schedule") ||
      msg.includes("meeting") ||
      msg.includes("when")
    ) {
      return {
        text: "🗓️ **CHAPTER SCHEDULE**\n\n**Regular Meetings:**\nEvery week during the semester\n(Check with officers for exact schedule)\n\n**Foundation Day:**\nOctober 4 - Annual celebration\n\n**Community Service:**\nMonthly outreach programs\nQuarterly blood donation drives\n\n**Recruitment Period:**\nStart of each semester",
        quickReplies: ["Join TGP", "Contact", "Activities"],
      };
    }

    return {
      text: "I can help you learn about Tau Gamma Phi — Verdant Chapter at Perpetual Help! Ask me about:\n\n• Our brotherhood and values\n• Chapter activities and events\n• How to join TGP\n• Our history and legacy\n• Contact information\n\nWhat would you like to know? 🔱",
      quickReplies: ["About Us", "Join TGP", "Events", "Contact"],
    };
  };

  const handleSendMessage = (message?: string) => {
    const text = message || inputMessage;
    if (!text.trim() || isLoading) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInputMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages((prev) => [...prev, { type: "bot", ...response }]);
      setIsLoading(false);
    }, 800);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        style={{
          background: "#1a4d1a",
          border: "2px solid #d4a017",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Open Chatbot"
      >
        {isChatOpen ? (
          <X className="w-6 h-6" style={{ color: "#d4a017" }} />
        ) : (
          <span className="text-2xl">🔱</span>
        )}
        <span
          className="absolute -top-1 -right-1 text-[10px] sm:text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
          style={{ background: "#d4a017", color: "#1a2e1a" }}
        >
          TGP
        </span>
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div
          className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[550px] sm:w-96 h-full w-full sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ background: "#fff", border: "0.5px solid #c8e6c8" }}
        >
          {/* Header */}
          <div
            className="p-3 sm:p-4 flex items-center gap-3"
            style={{ background: "#1a4d1a" }}
          >
            <div
              className="p-2 rounded-full flex-shrink-0"
              style={{ background: "#f2faf2" }}
            >
              <span className="text-xl sm:text-2xl">🔱</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-base sm:text-lg truncate"
                style={{ color: "#d4a017" }}
              >
                Tau Gamma Phi
              </h3>
              <p
                className="text-[10px] sm:text-xs truncate"
                style={{ color: "#a8d4a8" }}
              >
                Verdant Chapter · Perpetual Help
              </p>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded flex-shrink-0 hover:opacity-75"
              style={{ color: "#a8d4a8" }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
            style={{ background: "#f2faf2" }}
          >
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm whitespace-pre-line break-words"
                    style={
                      message.type === "user"
                        ? {
                            background: "#1a4d1a",
                            color: "#f2faf2",
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: "#fff",
                            color: "var(--color-text-primary)",
                            borderBottomLeftRadius: 4,
                            borderLeft: "3px solid #1a4d1a",
                            border: "0.5px solid #c8e6c8",
                            borderLeftWidth: 3,
                            borderLeftColor: "#1a4d1a",
                          }
                    }
                  >
                    {message.text}
                  </div>
                </div>

                {message.type === "bot" && message.quickReplies && (
                  <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                    {message.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs rounded-full transition-all"
                        style={{
                          border: "1.5px solid #1a4d1a",
                          color: "#1a4d1a",
                          background: "#fff",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.background =
                            "#1a4d1a";
                          (e.target as HTMLButtonElement).style.color =
                            "#d4a017";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.background =
                            "#fff";
                          (e.target as HTMLButtonElement).style.color =
                            "#1a4d1a";
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                className="flex items-center gap-2 text-xs sm:text-sm"
                style={{ color: "#6b8f6b" }}
              >
                <span className="animate-pulse">🔱</span>
                <span>Typing…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-3 sm:p-4 border-t"
            style={{ background: "#fff", borderColor: "#d0e8d0" }}
          >
            <div className="flex gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
                className="flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none disabled:opacity-50"
                style={{ border: "0.5px solid #c8e6c8", background: "#f9fdf9" }}
                placeholder="Ask about TGP..."
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="p-2 sm:p-2.5 rounded-lg transition disabled:opacity-50 flex-shrink-0 flex items-center justify-center"
                style={{ background: "#1a4d1a" }}
              >
                <Send
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: "#d4a017" }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
