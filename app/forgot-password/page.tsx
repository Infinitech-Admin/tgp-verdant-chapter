"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await authClient.forgotPassword(email);

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: result.message || "Please try again.",
        });
        return;
      }

      setSubmitted(true);
      toast({
        title: "Check your email",
        description: result.message || "A password reset link has been sent.",
        className: "bg-green-50 border-green-200",
      });
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              {submitted ? (
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              ) : (
                <Mail className="w-7 h-7 text-yellow-700" />
              )}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-900 via-red-800 to-yellow-500/80 bg-clip-text text-transparent mb-2">
              {submitted ? "Check Your Email" : "Forgot Password?"}
            </h1>
            <p className="text-gray-600 text-sm">
              {submitted
                ? "If that email is associated with an account, we've sent a link to reset your password."
                : "Enter the email associated with your account and we'll send you a link to reset your password."}
            </p>
          </motion.div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                  } focus:ring-2 transition`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-red-600 text-xs">
                    {errors.email.join(", ")}
                  </p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full px-6 py-4 rounded-lg bg-gradient-to-br from-yellow-700/90 via-red-700/60 to-[#800000]/90 text-white font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSubmitted(false)}
              className="w-full px-6 py-3 rounded-lg border border-orange-200 text-gray-700 font-medium hover:bg-orange-50 transition"
            >
              Send another email
            </motion.button>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 pt-6 border-t border-orange-100 text-center"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-yellow-600 font-semibold hover:text-yellow-500 text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
