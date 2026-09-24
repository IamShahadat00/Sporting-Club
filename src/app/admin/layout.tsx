"use client";

import Link from "next/link";
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
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/announcements", label: "News & Events", icon: Megaphone },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/10">
      <aside className="w-60 border-r bg-card p-4 flex flex-col sticky top-0 h-screen">
        <div className="flex-1 space-y-1 overflow-y-auto">
          <h2 className="font-black text-lg mb-6 px-2 text-pitch uppercase tracking-tighter italic">
            BADC Admin
          </h2>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </div>

        <div className="border-t pt-4 mt-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Back to Website
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-danger/10 text-danger transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
