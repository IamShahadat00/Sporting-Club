// src/app/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Radio,
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/matches", label: "Matches", icon: Radio },
  { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/admin/brackets", label: "Brackets", icon: GitBranch },
  { href: "/admin/registrations", label: "Registrations", icon: UserCheck },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/players", label: "Players", icon: User },
  { href: "/admin/hall-of-fame", label: "Hall of Fame", icon: Heart },
  { href: "/admin/sponsors", label: "Sponsors", icon: Award },
  { href: "/admin/banners", label: "Banners", icon: Megaphone },
  { href: "/admin/directors", label: "Directors", icon: Shield },
  {
    href: "/admin/users",
    label: "Users & Managers",
    icon: Users,
    adminOnly: true,
  },
  { href: "/admin/announcements", label: "News & Events", icon: Megaphone },
];

export function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className="w-64 border-r border-white/10 bg-slate-950 p-4 flex flex-col sticky top-0 h-screen shrink-0">
      <div className="flex-1 space-y-1 overflow-y-auto">
        <div className="px-3 py-4 mb-4 border-b border-white/10">
          <h2 className="font-black text-xl text-pitch uppercase tracking-tighter italic">
            BADC Control
          </h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-slate-400 truncate max-w-[120px]">
              {user?.name}
            </span>
            <Badge className="bg-pitch/20 text-pitch border-pitch/30 text-[9px] uppercase font-black">
              {user?.role}
            </Badge>
          </div>
        </div>

        {NAV.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                active
                  ? "bg-pitch text-black shadow-md shadow-pitch/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ExternalLink className="h-4 w-4" /> Live Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
