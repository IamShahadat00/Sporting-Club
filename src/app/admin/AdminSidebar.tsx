// src/app/admin/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Radio,
  Star, // <-- Added missing import
  Trophy,
  GitBranch,
  Users,
  UserCheck,
  Award,
  Megaphone,
  User,
  Shield,
  ExternalLink,
  LogOut,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/matches", label: "Matches", icon: Radio },
  { href: "/admin/ratings", label: "Player Ratings & Stats", icon: Star },
  { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/admin/brackets", label: "Brackets", icon: GitBranch },
  { href: "/admin/registrations", label: "Registrations", icon: UserCheck },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/players", label: "Players", icon: User },
  { href: "/admin/hall-of-fame", label: "Hall of Fame", icon: Heart },
  { href: "/admin/sponsors", label: "Sponsors", icon: Award },
  { href: "/admin/banners", label: "Banners", icon: Megaphone },
  { href: "/admin/directors", label: "Directors", icon: Shield },
  { href: "/admin/users", label: "Users & Managers", icon: Users, adminOnly: true },
  { href: "/admin/announcements", label: "News & Events", icon: Megaphone },
];

export function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-1">
      {NAV.map((item) => {
        if (item.adminOnly && !isAdmin) return null;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              active
                ? "bg-pitch text-white shadow-md shadow-pitch/20 font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR (Fixed on Mobile) */}
      <div className="lg:hidden sticky top-0 z-40 w-full bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-pitch" />
          <span className="font-black text-sm uppercase tracking-tight text-foreground">
            BADC <span className="text-pitch">Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="text-[9px] font-black uppercase bg-pitch/20 text-pitch border-pitch/30">
            {user?.role}
          </Badge>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border p-4 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="px-2 pb-2 border-b border-border text-xs text-muted-foreground font-bold">
                Logged in as <span className="text-foreground">{user?.name}</span>
              </div>
              <NavLinks onClick={() => setMobileOpen(false)} />
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" /> View Live Site
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - LOCKED AND STATIONARY */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card p-4 flex-col sticky top-0 h-screen shrink-0 overflow-hidden select-none">
        <div className="px-3 py-3 mb-2 border-b border-border">
          <h2 className="font-black text-xl text-pitch uppercase tracking-tighter italic">
            BADC Control
          </h2>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-bold text-muted-foreground truncate max-w-[120px]">
              {user?.name}
            </span>
            <Badge className="bg-pitch/20 text-pitch border-pitch/30 text-[9px] uppercase font-black">
              {user?.role}
            </Badge>
          </div>
        </div>

        {/* Scrollable Nav Items within Stationary Sidebar */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 no-scrollbar">
          <NavLinks />
        </div>

        <div className="border-t border-border pt-3 mt-2 space-y-1.5 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> View Live Site
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}