"use client";

import type React from "react";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!token || !email) {
      toast({
        variant: "destructive",
        title: "Invalid Link",
        description:
          "This password reset link is missing required information.",
      });
      return;
    }

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: ["Passwords do not match"] });
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.resetPassword(
        token,
        email,
        password,
        passwordConfirmation,
      );

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: result.message || "Unable to reset your password.",
        });
        return;
      }

      toast({
        title: "✓ Password Reset",
        description: "Your password has been updated. Redirecting to login...",
        className: "bg-green-50 border-green-200",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-orange-50 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-yellow-700" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-900 via-red-800 to-yellow-500/80 bg-clip-text text-transparent mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm">
              Enter a new password for {email || "your account"}
            </p>
          </div>

          {!token || !email ? (
            <div className="text-center">
              <p className="text-red-600 text-sm mb-4">
                This reset link is invalid or incomplete. Please request a new
                one.
              </p>
              <Link
                href="/forgot-password"
                className="text-yellow-600 font-bold hover:text-yellow-500"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                  } focus:ring-2 transition`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                {errors.password && (
                  <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{errors.password.join(", ")}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password_confirmation
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                  } focus:ring-2 transition`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                {errors.password_confirmation && (
                  <div className="mt-1 flex items-start gap-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{errors.password_confirmation.join(", ")}</span>
                  </div>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full px-6 py-4 rounded-lg bg-gradient-to-br from-yellow-700/90 via-red-700/60 to-[#800000]/90 text-white font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-orange-100 text-center">
            <Link
              href="/login"
              className="text-yellow-600 font-bold hover:text-yellow-500 text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
