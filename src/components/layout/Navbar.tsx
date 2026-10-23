"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Trophy, Moon, Sun, Menu, X, Shield, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Tournament Hub", href: "/tournament-hub" },
  { label: "Match Center", href: "/match-center" },
  { label: "Teams", href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Hall of Fame", href: "/hall-of-fame" },
  { label: "Directors", href: "/directors" },
];

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-black text-lg sm:text-xl tracking-tighter shrink-0">
          <Trophy className="h-6 w-6 text-pitch" />
          <span className="text-foreground">
            BADC SPORTING <span className="text-pitch">CLUB</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-xs uppercase font-black tracking-widest transition-colors ${
                  active ? "text-pitch" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme and Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full text-foreground hover:bg-muted"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Link href="/admin/dashboard" className="hidden sm:inline-flex">
            <Button
              size="sm"
              className="bg-pitch hover:bg-pitch-dark text-white font-black uppercase text-xs tracking-wider rounded-xl px-5 h-9"
            >
              Admin Panel
            </Button>
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle mobile menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-b border-border bg-background px-6 py-6 space-y-4 overflow-hidden"
          >
            <nav className="flex flex-col space-y-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-black uppercase tracking-wider transition-colors ${
                      active
                        ? "bg-pitch/10 text-pitch border border-pitch/30"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Link href="/admin/dashboard" className="w-full">
                <Button className="w-full bg-pitch hover:bg-pitch-dark text-white font-black uppercase tracking-widest rounded-xl h-11">
                  <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}