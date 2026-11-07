"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({
  fallbackHref = "/",
  forceHref,
  label = "Back",
  className = "",
}: {
  fallbackHref?: string;
  forceHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    // If a specific destination is forced (like the landing page on /login), always go there directly
    if (forceHref) {
      router.push(forceHref);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-pitch transition-all group cursor-pointer ${className}`}
    >
      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
}

export default BackButton;
