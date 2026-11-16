"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { requestPasswordResetAction, resetPasswordAction } from "../../lib/auth/actions";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetTokenLink, setResetTokenLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);

    try {
      const res = await requestPasswordResetAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to process request.");
      } else {
        setMessage(res.message || "Reset link generated.");
        if (res.token) {
          setResetTokenLink(`/forgot-password?token=${res.token}`);
        }
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("token", token || "");
    formData.append("newPassword", newPassword);

    try {
      const res = await resetPasswordAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to reset password.");
      } else {
        setMessage(res.message || "Password updated successfully.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#FFFFFF] p-8 rounded-xl border border-[#E4E7EC] shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#17324D] flex items-center justify-center text-white mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-[#3E9C96]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            {token ? "Set New Password" : "Reset Your Password"}
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            {token
              ? "Enter your new secure password below"
              : "Enter your registered email to receive a password reset link"}
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF3F2] border border-[#B42318]/30 rounded-lg p-3 text-xs text-[#B42318] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-[#ECFDF3] border border-[#18794E]/30 rounded-lg p-3 text-xs text-[#18794E] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {resetTokenLink && (
          <div className="bg-[#EFF7F6] border border-[#2F7D78]/20 p-3 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-[#17324D] block">
              Direct Reset Link (Local Development):
            </span>
            <Link
              href={resetTokenLink}
              className="text-[#2F7D78] hover:underline font-medium break-all"
            >
              Click here to proceed with password reset
            </Link>
          </div>
        )}

        {token ? (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? "Updating password..." : "Update Password"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-[#667085]">
          Remembered your password?{" "}
          <Link href="/login" className="text-[#2F7D78] hover:underline font-semibold">
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#667085]">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
