"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Use authClient.login with membership_id
      const result = await authClient.login(membershipId, password);

      if (!result.success) {
        // Handle validation errors
        if (result.errors) {
          setErrors(result.errors);

          toast({
            variant: "destructive",
            title: "Validation Errors",
            description: (
              <div className="mt-2 space-y-1">
                {Object.entries(result.errors).map(([field, messages]) => (
                  <div key={field} className="text-sm">
                    <span className="font-medium capitalize">
                      {field.replace("_", " ")}:
                    </span>
                    <ul className="ml-4">
                      {(messages as string[]).map((msg, idx) => (
                        <li key={idx}>- {msg}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ),
          });
        }
        // Handle 401 - Invalid credentials
        else if (result.status === 401) {
          toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: (
              <div>
                <p className="font-semibold mb-1">
                  {result.message || "Membership ID or password is incorrect"}
                </p>
                <p className="text-sm mt-2">Please check:</p>
                <ul className="text-sm ml-4 mt-1 space-y-1">
                  <li>• Your membership ID is correct (e.g., TGP-2025-0001)</li>
                  <li>• Your password is correct (case-sensitive)</li>
                  <li>• Caps Lock is not enabled</li>
                </ul>
              </div>
            ),
          });
        }
        // Handle 403 - Account status issues
        else if (result.status === 403) {
          const statusMessage =
            result.message || "Your account is not yet approved";
          const isPending =
            statusMessage.toLowerCase().includes("pending") ||
            result.data?.status === "pending";
          const isRejected =
            statusMessage.toLowerCase().includes("rejected") ||
            result.data?.status === "rejected";
          const isDeactivated =
            statusMessage.toLowerCase().includes("deactivated") ||
            result.data?.status === "deactivated";

          if (isPending) {
            toast({
              title: "⏳ Account Pending Approval",
              description: (
                <div className="space-y-2">
                  <p className="font-medium">
                    Your account is waiting for administrator verification.
                  </p>
                  <div className="text-sm space-y-1 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <p className="font-semibold text-yellow-800">
                      What's next?
                    </p>
                    <ul className="ml-4 space-y-1 text-yellow-700">
                      <li>• Your registration has been received</li>
                      <li>• An administrator will review your documents</li>
                      <li>• You'll receive an email once approved</li>
                      {result.data?.registered_at && (
                        <li>• Registered: {result.data.registered_at}</li>
                      )}
                    </ul>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This usually takes 1-3 business days
                  </p>
                </div>
              ),
              duration: 10000,
              className: "bg-yellow-50 border-yellow-300",
            });
          } else if (isRejected) {
            toast({
              variant: "destructive",
              title: "❌ Account Rejected",
              description: (
                <div>
                  <p className="font-semibold mb-2">
                    Your registration was not approved.
                  </p>
                  {result.data?.reason && (
                    <p className="text-sm mb-2">Reason: {result.data.reason}</p>
                  )}
                  <p className="text-sm mt-3 font-medium">
                    Please contact the administrator or register again with
                    valid documents.
                  </p>
                </div>
              ),
              duration: 10000,
            });
          } else if (isDeactivated) {
            toast({
              variant: "destructive",
              title: "🚫 Account Deactivated",
              description: (
                <div>
                  <p className="font-semibold mb-2">
                    Your account has been deactivated.
                  </p>
                  {result.data?.reason && (
                    <p className="text-sm mb-2">Reason: {result.data.reason}</p>
                  )}
                  <p className="text-sm mt-3 font-medium">
                    Please contact the administrator for assistance.
                  </p>
                </div>
              ),
              duration: 10000,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: statusMessage,
              duration: 6000,
            });
          }
        }
        // Handle other errors
        else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: result.message || "An unexpected error occurred",
          });
        }
        return;
      }

      // Success!
      toast({
        title: "✓ Login Successful!",
        description: (
          <div>
            <p className="font-semibold">
              Welcome back, {result.user?.name || "User"}!
            </p>
            <p className="text-sm">
              Membership ID: {result.user?.membership_id}
            </p>
            <p className="text-sm">Redirecting to home page...</p>
          </div>
        ),
        className: "bg-green-50 border-green-200",
        duration: 3000,
      });

      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast({
          variant: "destructive",
          title: "Network Connection Error",
          description: (
            <div>
              <p className="font-semibold mb-2">
                Unable to connect to the server
              </p>
              <p className="text-sm">Please check:</p>
              <ul className="text-sm ml-4 mt-1 space-y-1">
                <li>• Your internet connection is active</li>
                {/* <li>• Laravel backend is running (http://localhost:8000)</li> */}
                <li>• No firewall is blocking the connection</li>
              </ul>
            </div>
          ),
        });
      } else {
        toast({
          variant: "destructive",
          title: "Unexpected Error",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin(e as any);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            {/* Two logos side by side */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <Image
                src="/sigma-verdant-logo2.png"
                alt="Verdant Chapter Logo"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
              <Image
                src="/sigma-verdant-logo.png"
                alt="Sigma Verdant Logo"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-900 via-red-800 to-yellow-500/80 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your Verdant Account</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Membership ID
              </label>
              <input
                type="text"
                value={membershipId}
                onChange={(e) => {
                  setMembershipId(e.target.value.toUpperCase());
                  if (errors.membership_id) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.membership_id;
                      return newErrors;
                    });
                  }
                }}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.membership_id
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                } focus:ring-2 transition uppercase font-mono`}
                placeholder="TGP-2025-0001"
                autoComplete="username"
              />
              {errors.membership_id && (
                <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{errors.membership_id.join(", ")}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Use the membership ID provided after registration
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      return newErrors;
                    });
                  }
                }}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                } focus:ring-2 transition`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{errors.password.join(", ")}</span>
                </div>
              )}
            </motion.div>

            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full px-6 py-4 rounded-lg bg-gradient-to-br from-yellow-700/90 via-red-700/60 to-[#800000]/90 text-white font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-8 border-t border-orange-100 text-center"
          >
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-yellow-600 font-bold hover:text-yellow-500"
              >
                Register here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
