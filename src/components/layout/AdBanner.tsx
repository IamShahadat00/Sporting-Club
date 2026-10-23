"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Sparkles } from "lucide-react";
export { ModernAdSidebars } from "./ModernAdSidebars";

export function AdBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data);
      })
      .catch(() => {});
  }, []);

  const activeBanner = banners[0];
  if (closed || !activeBanner || !activeBanner.imageUrl?.trim()) return null;

  return (
    <div className="relative w-full bg-background border-b border-border backdrop-blur-md z-40">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <a
          href={activeBanner.linkUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 overflow-hidden group"
        >
          <span className="bg-pitch/15 text-pitch border border-pitch/30 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 tracking-widest">
            Sponsored
          </span>
          <div className="h-9 max-w-[700px] w-full rounded-md overflow-hidden relative shadow-sm border border-border">
            <img
              src={activeBanner.imageUrl}
              alt="Promotion"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-pitch transition-colors shrink-0 hidden sm:block" />
        </a>

        <button
          onClick={() => setClosed(true)}
          className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function DynamicAdCard({
  title = "Official Club Partner",
  description = "Support the brands driving BADC Sporting Club forward this season.",
  ctaText = "Explore Now",
  linkUrl = "#",
  imageUrl,
}: {
  title?: string;
  description?: string;
  ctaText?: string;
  linkUrl?: string;
  imageUrl?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 md:p-8 shadow-xl my-6">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-pitch/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5 w-full md:w-auto">
          {imageUrl && (
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden border border-border shrink-0 bg-muted p-1">
              <img src={imageUrl} alt="" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-pitch text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Promotion
              </span>
              <Sparkles className="h-3.5 w-3.5 text-pitch" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-tight text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground font-medium max-w-xl">{description}</p>
          </div>
        </div>

        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto text-center shrink-0 bg-pitch hover:bg-pitch-dark text-white font-black uppercase text-xs tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-pitch/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {ctaText} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}