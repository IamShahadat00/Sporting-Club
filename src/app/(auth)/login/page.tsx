"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error(res.error || "Invalid credentials");
      setLoading(false);
    } else {
      toast.success("Identity Verified!");
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pitch/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* BACK BUTTON */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-pitch font-black uppercase text-[10px] tracking-widest transition-all group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-white/5 bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="text-center space-y-2">
                <div className="bg-pitch/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pitch/20">
                  <Lock className="text-pitch h-8 w-8" />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                  Secure Login
                </h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest px-4">
                  Authorized Personnel Only
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                    Email Identity
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-white/5 h-12 rounded-xl focus:ring-pitch transition-all"
                    placeholder="admin@badc.club"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950 border-white/5 h-12 rounded-xl focus:ring-pitch transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 bg-pitch hover:bg-pitch-dark text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-pitch/10 transition-all active:scale-95"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Access Dashboard"}
                </Button>
              </form>

              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Want to contribute?{" "}
                  <Link href="/register" className="text-pitch hover:underline">
                    Apply for Manager access
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
