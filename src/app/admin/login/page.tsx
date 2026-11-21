"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/client";
import { cyberSound } from "@/lib/cyberSound";
import {
  Shield,
  KeyRound,
  Mail,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detect existing session on page load (e.g. redirected here because AAL2 is needed)
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && user.app_metadata?.role === "admin") {
          const { data: aal, error } =
            await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (!error && aal) {
            if (aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
              setRequiresMfa(true);
            } else if (aal.currentLevel === "aal2" || aal.nextLevel === "aal1") {
              router.push("/admin");
            }
          }
        }
      } catch {
        // Ignore session check error on mount
      }
    }
    checkExistingSession();
  }, [router]);

  const handleCancelMfa = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setRequiresMfa(false);
      setMfaCode("");
      setErrorMessage(null);
    } catch {
      setRequiresMfa(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (requiresMfa) {
        // Handle MFA Verification Challenge
        const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
        if (factorError || !factors.totp || factors.totp.length === 0) {
          throw new Error("No MFA factor registered for this account.");
        }
        const factorId = factors.totp[0].id;
        const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: mfaCode.trim(),
        });
        if (verifyError) {
          throw new Error(`MFA verification failed: ${verifyError.message}`);
        }
        cyberSound.playLaunch();
        router.push("/admin");
        return;
      }

      // Initial Email & Password Sign-in
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check if MFA is required
      const { data: mfaData, error: mfaCheckError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (!mfaCheckError && mfaData.nextLevel === "aal2" && mfaData.currentLevel === "aal1") {
        setRequiresMfa(true);
        setLoading(false);
        return;
      }

      cyberSound.playLaunch();
      router.push("/admin");
    } catch (err: unknown) {
      cyberSound.playClick();
      const message = err instanceof Error ? err.message : "Authentication failed";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff1e38]/12 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#11131a] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(255,30,56,0.2)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/10 p-2 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Image
              src={siteConfig.assets.logo}
              alt="UGG"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ff1e38]/15 border border-[#ff1e38]/30 text-[#ff1e38] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>SECURE COORDINATOR ACCESS</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            UGG Portal Login
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Authenticate with verified guild credentials to manage tournaments.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {!requiresMfa ? (
            <>
              <div>
                <label
                  htmlFor="coordinator-email"
                  className="text-xs uppercase font-extrabold tracking-wider text-gray-300 block mb-1.5"
                >
                  Coordinator Email
                </label>
                <div className="relative">
                  <input
                    id="coordinator-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coordinator@uem.edu.in"
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all pl-11 shadow-inner focus:ring-1 focus:ring-[#ff1e38]"
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="coordinator-password"
                  className="text-xs uppercase font-extrabold tracking-wider text-gray-300 block mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="coordinator-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/60 border border-gray-800 focus:border-[#ff1e38] rounded-xl px-4 py-3 text-white text-xs outline-none transition-all pl-11 pr-11 shadow-inner focus:ring-1 focus:ring-[#ff1e38]"
                  />
                  <KeyRound className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label
                htmlFor="mfa-code"
                className="text-xs uppercase font-extrabold tracking-wider text-amber-300 block mb-1.5"
              >
                MFA Authenticator Code (6 Digits)
              </label>
              <input
                id="mfa-code"
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-black/60 border border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-3 text-center text-white text-lg font-mono tracking-widest outline-none shadow-inner"
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white bg-gradient-to-r from-[#ff1e38] to-[#b80d22] hover:from-[#ff2a44] hover:to-[#ff1e38] transition-all duration-300 shadow-[0_0_20px_rgba(229,29,54,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-98"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : requiresMfa ? (
              <span>Verify MFA & Enter</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In to Coordinator Portal</span>
              </>
            )}
          </button>

          {requiresMfa && (
            <button
              type="button"
              onClick={handleCancelMfa}
              className="w-full py-2.5 rounded-xl font-semibold uppercase tracking-wider text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel / Switch Account
            </button>
          )}

          <div className="text-center pt-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Main Arena</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
