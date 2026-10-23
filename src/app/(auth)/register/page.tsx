// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ManagerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
      } else {
        setSubmitted(true);
        toast.success("Manager registration submitted!");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pitch/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-pitch font-black uppercase text-[10px] tracking-widest transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/10 bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardContent className="p-8 md:p-10 space-y-6">
              {submitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="bg-pitch/20 text-pitch h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    Application Received
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Your account has been registered with the role{" "}
                    <span className="text-pitch font-bold">MANAGER</span>. An
                    Administrator must approve your account before access is granted.
                  </p>
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full h-12 bg-pitch hover:bg-pitch-dark text-black font-black uppercase tracking-wider rounded-xl mt-4"
                  >
                    Return to Login
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <div className="bg-pitch/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-pitch/20">
                      <UserPlus className="text-pitch h-7 w-7" />
                    </div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                      Manager Signup
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Request BADC Management Access
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-950 border-white/10 h-11 rounded-xl text-white focus:ring-pitch"
                        placeholder="Rahim Ahmed"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Official Email
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950 border-white/10 h-11 rounded-xl text-white focus:ring-pitch"
                        placeholder="manager@badc.club"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Password
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-950 border-white/10 h-11 rounded-xl text-white focus:ring-pitch"
                        placeholder="Minimum 6 characters"
                        minLength={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-pitch hover:bg-pitch-dark text-black font-black uppercase tracking-wider rounded-xl mt-2"
                    >
                      {loading ? "Submitting..." : "Apply for Manager Access"}
                    </Button>
                  </form>

                  <div className="pt-4 border-t border-white/10 text-center">
                    <p className="text-[11px] text-slate-400 font-bold">
                      Already have an account?{" "}
                      <Link href="/login" className="text-pitch hover:underline">
                        Log in here
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}