"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        if (
          res.code === "pending_approval" ||
          res.error.includes("pending_approval") ||
          res.error.includes("PENDING_APPROVAL")
        ) {
          toast.error(
            "Access Denied: Your account is pending review by the Administrator.",
          );
        } else {
          toast.error(
            "Invalid credentials. Please verify your email and password.",
          );
        }
        setLoading(false);
      } else {
        toast.success("Identity Verified! Entering dashboard...");
        window.location.href = callbackUrl;
      }
    } catch {
      toast.error("An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 space-y-6">
      {/* Clicking this button navigates directly to "/" */}
      <BackButton forceHref="/" fallbackHref="/" label="Back to Home" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border bg-card/90 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
            <div className="text-center space-y-2">
              <div className="bg-pitch/10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-pitch/20">
                <Lock className="text-pitch h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-foreground">
                System Login
              </h1>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest px-2">
                Administrator & Manager Portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
                  Email Identity
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-input h-11 sm:h-12 rounded-xl focus:ring-pitch transition-all text-sm"
                  placeholder="admin@badc.club"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-input h-11 sm:h-12 rounded-xl focus:ring-pitch transition-all text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 sm:h-14 bg-pitch hover:bg-pitch-dark text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-pitch/20 transition-all active:scale-95 text-xs sm:text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </span>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-border text-center">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                Need Manager access?{" "}
                <Link
                  href="/register"
                  className="text-pitch hover:underline ml-1"
                >
                  Apply here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-pitch/10 blur-[120px] rounded-full pointer-events-none" />
      <Suspense
        fallback={
          <div className="text-sm font-bold animate-pulse text-pitch">
            Loading security portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
