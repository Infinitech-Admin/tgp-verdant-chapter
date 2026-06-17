"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Download,
  Smartphone,
  LayoutDashboard,
  User,
  LogOut,
  ShoppingCart,
  ShoppingBag,
  Building2,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/announcements", label: "Announcements" },
  { href: "/news", label: "News" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/handbook", label: "Handbook" },
];

const loginLink = "/login";

// --- TGS Brand Colors ---
const TGS = {
  black: "#0a0a0a",
  greenDark: "#1a4d1a",
  green: "#2a6e2a",
  greenLight: "#3a8c3a",
  gold: "#d4a017",
  goldLight: "#f0c040",
  white: "#ffffff",
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface BusinessPartner {
  id: number;
  business_name: string;
  category?: string;
  description?: string;
  website_link?: string;
  photo?: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>(
    [],
  );
  const [partnersLoading, setPartnersLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const { items } = useCart();
  const cartItemCount = items.length;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBusinessPartners = async () => {
      try {
        setPartnersLoading(true);
        const res = await fetch("/api/business-partners");
        const data = await res.json();
        if (data.success && data.data) {
          const partnersData = data.data.data || data.data;
          const approvedPartners = partnersData.filter(
            (p: BusinessPartner) => p.status === "approved",
          );
          setBusinessPartners(approvedPartners);
        }
      } catch (err) {
        console.error("[Header] Error fetching business partners:", err);
      } finally {
        setPartnersLoading(false);
      }
    };
    fetchBusinessPartners();
  }, []);

  useEffect(() => {
    const checkIOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(ua);
      setIsIOS(isIOSDevice);
      return isIOSDevice;
    };

    const iosDetected = checkIOS();

    const checkInstalled = () => {
      const isStandaloneDisplay = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isIOSStandalone = window.navigator.standalone === true;
      const isAndroidApp = document.referrer.includes("android-app://");
      const installed = isStandaloneDisplay || isIOSStandalone || isAndroidApp;
      if (installed) {
        setIsInstalled(true);
        setShowInstallButton(false);
        return true;
      }
      return false;
    };

    if (checkInstalled()) return;

    setShowInstallButton(true);
    if (iosDetected) return;

    if (globalDeferredPrompt) setDeferredPrompt(globalDeferredPrompt);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt && !globalDeferredPrompt) {
      alert(
        "Install prompt not available. Please try:\n• Using Chrome or Edge browser\n• Ensuring site is served over HTTPS\n• Refreshing the page",
      );
      return;
    }
    const prompt = deferredPrompt || globalDeferredPrompt;
    try {
      await prompt!.prompt();
      await prompt!.userChoice;
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    } catch (error) {
      console.error("Install error:", error);
      alert("Installation failed. Please try again later.");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        setShowUserMenu(false);
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    return user.role === "admin" ? "/dashboard/admin" : "/dashboard/member";
  };

  const getOrdersLink = () => "/orders";

  const handleCartClick = () => router.push("/products/cart");

  return (
    <>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: TGS.black,
          borderBottom: `2px solid ${TGS.gold}`,
          boxShadow: `0 2px 0 0 ${TGS.greenDark}`,
        }}
      >
        {/* Gold-green gradient stripe at very bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${TGS.greenDark}, ${TGS.gold}, ${TGS.greenDark})`,
          }}
        />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-3.5 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 md:gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 md:gap-3 cursor-pointer"
            >
              {/* Logo ring — styled like the TGS badge outer ring */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: `2.5px solid ${TGS.gold}`,
                  background: TGS.greenDark,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <img
                  src="/sigma-verdant-logo.png"
                  alt="Verdant Chapter Logo"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  className="text-sm md:text-base font-semibold"
                  style={{
                    color: TGS.goldLight,
                    letterSpacing: "0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Verdant Chapter
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: TGS.greenLight,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    lineHeight: 1.3,
                    fontSize: 10,
                  }}
                >
                  Las Piñas · Triskelion
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 group"
                    style={{
                      color: isActive ? TGS.goldLight : "#cccccc",
                      background: isActive
                        ? "rgba(212,160,23,0.1)"
                        : "transparent",
                    }}
                  >
                    {link.label}
                    {/* Active underline */}
                    <span
                      style={{
                        position: "absolute",
                        bottom: 2,
                        left: 10,
                        right: 10,
                        height: 1.5,
                        borderRadius: 2,
                        background: TGS.gold,
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 0.2s",
                      }}
                    />
                    {/* Hover underline */}
                    <span
                      className="group-hover:opacity-100"
                      style={{
                        position: "absolute",
                        bottom: 2,
                        left: 10,
                        right: 10,
                        height: 1.5,
                        borderRadius: 2,
                        background: TGS.gold,
                        opacity: isActive ? 0 : 0,
                        transition: "opacity 0.2s",
                      }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Action Buttons */}
          <motion.div
            className="hidden lg:flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AnimatePresence mode="wait">
              {showInstallButton && !isInstalled && (
                <motion.button
                  key="install-button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                  style={{
                    padding: "7px 16px",
                    borderRadius: 20,
                    background: "transparent",
                    border: `1.5px solid ${TGS.greenLight}`,
                    color: TGS.greenLight,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      TGS.green;
                    (e.currentTarget as HTMLButtonElement).style.color =
                      TGS.white;
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      TGS.green;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      TGS.greenLight;
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      TGS.greenLight;
                  }}
                >
                  <Download size={15} />
                  {isIOS ? "Install" : "Install App"}
                </motion.button>
              )}
            </AnimatePresence>

            {user ? (
              <>
                {/* Cart */}
                <button
                  onClick={handleCartClick}
                  title="View Cart"
                  className="relative p-2 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(212,160,23,0.12)",
                    color: TGS.goldLight,
                  }}
                >
                  <ShoppingCart size={18} />
                  {cartItemCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ background: TGS.gold, color: TGS.black }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                    style={{
                      padding: "7px 16px",
                      borderRadius: 20,
                      background: TGS.gold,
                      color: TGS.black,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <User size={15} />
                    <span className="hidden xl:inline max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-2 z-50"
                        style={{
                          background: "#111",
                          border: `1px solid ${TGS.gold}`,
                        }}
                      >
                        <div
                          className="px-4 py-3"
                          style={{
                            borderBottom: `1px solid rgba(212,160,23,0.2)`,
                          }}
                        >
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: TGS.goldLight }}
                          >
                            {user.name}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: "#888" }}
                          >
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                          style={{ color: "#ccc" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = TGS.goldLight)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#ccc")
                          }
                        >
                          <LayoutDashboard size={15} />
                          Dashboard
                        </Link>
                        <Link
                          href={getOrdersLink()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                          style={{ color: "#ccc" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = TGS.goldLight)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#ccc")
                          }
                        >
                          <ShoppingBag size={15} />
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                          style={{ color: "#e57373" }}
                        >
                          <LogOut size={15} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                href={loginLink}
                className="text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  padding: "7px 20px",
                  borderRadius: 20,
                  background: TGS.gold,
                  color: TGS.black,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Login
              </Link>
            )}
          </motion.div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: TGS.goldLight }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden absolute top-full left-0 w-full z-[60] shadow-md overflow-y-auto max-h-[calc(100vh-64px)]"
                style={{
                  background: "#0d0d0d",
                  borderTop: `1px solid rgba(212,160,23,0.3)`,
                }}
              >
                <div className="px-4 py-4 space-y-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block text-sm font-medium py-2.5 px-3 rounded-lg transition-colors"
                        style={{
                          color: isActive ? TGS.goldLight : "#bbb",
                          background: isActive
                            ? "rgba(212,160,23,0.1)"
                            : "transparent",
                          borderLeft: isActive
                            ? `2px solid ${TGS.gold}`
                            : "2px solid transparent",
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {showInstallButton && !isInstalled && (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => {
                        handleInstallClick();
                        setIsOpen(false);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
                      style={{
                        background: "transparent",
                        border: `1.5px solid ${TGS.greenLight}`,
                        color: TGS.greenLight,
                      }}
                    >
                      <Download size={16} />
                      Install App
                    </motion.button>
                  )}

                  {user ? (
                    <div
                      className="pt-3 mt-3"
                      style={{ borderTop: `1px solid rgba(212,160,23,0.2)` }}
                    >
                      <div className="px-2 py-2 mb-2">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: TGS.goldLight }}
                        >
                          {user.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "#777" }}
                        >
                          {user.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          handleCartClick();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 mb-2 rounded-lg text-sm font-medium relative"
                        style={{
                          background: "rgba(212,160,23,0.1)",
                          color: TGS.goldLight,
                        }}
                      >
                        <ShoppingCart size={16} />
                        View Cart
                        {cartItemCount > 0 && (
                          <span
                            className="absolute right-3 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                            style={{ background: TGS.gold, color: TGS.black }}
                          >
                            {cartItemCount}
                          </span>
                        )}
                      </button>

                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-medium"
                        style={{
                          background: "rgba(42,110,42,0.15)",
                          color: TGS.greenLight,
                        }}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>

                      <Link
                        href={getOrdersLink()}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-lg text-sm font-medium"
                        style={{
                          background: "rgba(42,110,42,0.1)",
                          color: TGS.greenLight,
                        }}
                      >
                        <ShoppingBag size={16} />
                        My Orders
                      </Link>

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-lg text-sm font-medium"
                        style={{
                          background: "rgba(229,115,115,0.08)",
                          color: "#e57373",
                        }}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={loginLink}
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 mt-2 rounded-lg text-sm font-medium text-center"
                      style={{ background: TGS.gold, color: TGS.black }}
                    >
                      Login
                    </Link>
                  )}

                  {/* Business Partners */}
                  <div
                    className="pt-4 mt-4"
                    style={{ borderTop: `1px solid rgba(212,160,23,0.2)` }}
                  >
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <Building2 size={16} style={{ color: TGS.gold }} />
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: TGS.goldLight }}
                      >
                        Our Partners
                      </h3>
                    </div>

                    {partnersLoading ? (
                      <div className="flex justify-center py-4">
                        <div
                          className="animate-spin rounded-full h-7 w-7 border-b-2"
                          style={{ borderColor: TGS.gold }}
                        />
                      </div>
                    ) : businessPartners.length > 0 ? (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {businessPartners.map((partner) => (
                          <PartnerItem
                            key={partner.id}
                            partner={partner}
                            onClose={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p
                        className="text-xs text-center py-2"
                        style={{ color: "#666" }}
                      >
                        No partners available
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* iOS Install Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-6 relative"
              style={{ background: "#111", border: `1.5px solid ${TGS.gold}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-3 right-3 p-2 rounded-full transition-colors"
                style={{ color: "#888" }}
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2.5 rounded-full"
                  style={{ background: "rgba(212,160,23,0.15)" }}
                >
                  <Smartphone size={22} style={{ color: TGS.gold }} />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: TGS.goldLight }}
                  >
                    Install App
                  </h3>
                  <p className="text-xs" style={{ color: "#777" }}>
                    Add to Home Screen
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-5">
                {[
                  <>
                    Tap the{" "}
                    <strong style={{ color: TGS.goldLight }}>Share</strong>{" "}
                    button <span>⬆️</span> at the bottom of your browser
                  </>,
                  <>
                    Scroll down and tap{" "}
                    <strong style={{ color: TGS.goldLight }}>
                      "Add to Home Screen"
                    </strong>{" "}
                    <span>➕</span>
                  </>,
                  <>
                    Tap <strong style={{ color: TGS.goldLight }}>"Add"</strong>{" "}
                    to confirm installation
                  </>,
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: "rgba(212,160,23,0.15)",
                        color: TGS.gold,
                      }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm" style={{ color: "#ccc" }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95"
                style={{ background: TGS.gold, color: TGS.black }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PartnerItem({
  partner,
  onClose,
}: {
  partner: BusinessPartner;
  onClose: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = !!partner.photo;

  const content = (
    <div
      className="flex items-center gap-3 p-2 rounded-lg transition-colors"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div
        className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ background: "rgba(212,160,23,0.1)" }}
      >
        {hasValidImage && !imageError ? (
          <img
            src={partner.photo!}
            alt={partner.business_name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-base font-bold" style={{ color: "#d4a017" }}>
            {partner.business_name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#ddd" }}>
          {partner.business_name}
        </p>
        {partner.category && (
          <p className="text-xs truncate capitalize" style={{ color: "#666" }}>
            {partner.category}
          </p>
        )}
      </div>
    </div>
  );

  if (partner.website_link) {
    return (
      <a
        href={partner.website_link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}
