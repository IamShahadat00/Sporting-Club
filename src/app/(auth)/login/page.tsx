// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.code === "pending_approval" || res.error.includes("pending_approval")) {
          toast.error(
            "Access Denied: Your account is pending review by the Administrator."
          );
        } else {
          toast.error("Invalid credentials. Please verify your email and password.");
        }
      } else {
        toast.success("Identity Verified!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pitch/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <BackButton fallbackHref="/" label="Back to Home" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border bg-card/80 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="text-center space-y-2">
                <div className="bg-pitch/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pitch/20">
                  <Lock className="text-pitch h-8 w-8" />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                  System Login
                </h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest px-4">
                  Administrator & Manager Portal
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
                    Email Identity
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-input h-12 rounded-xl focus:ring-pitch transition-all"
                    placeholder="admin@badc.club"
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
                    className="bg-background border-input h-12 rounded-xl focus:ring-pitch transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 bg-pitch hover:bg-pitch-dark text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-pitch/10 transition-all active:scale-95"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Sign In"}
                </Button>
              </form>

              <div className="pt-6 border-t border-border text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Need Manager access?{" "}
                  <Link href="/register" className="text-pitch hover:underline">
                    Apply here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}