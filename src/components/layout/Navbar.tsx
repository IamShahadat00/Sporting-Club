"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Trophy, Moon, Sun, Menu, X } from "lucide-react";

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl tracking-tighter"
        >
          <Trophy className="h-6 w-6 text-pitch" />
          <span>
            BADC SPORTING <span className="text-pitch">CLUB</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            "Tournament Hub",
            "Match Center",
            "Teams",
            "Players",
            "Hall of Fame",
            "Directors",
          ].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-bold text-muted-foreground hover:text-pitch transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* THEME TOGGLE BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/admin/dashboard" className="hidden md:block">
            <Button
              size="sm"
              className="bg-pitch hover:bg-pitch-dark text-white font-bold rounded-full px-6"
            >
              Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
