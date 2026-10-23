"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Award, ExternalLink, Sparkles } from "lucide-react";

export function ModernAdSidebars() {
  const [banners, setBanners] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/banners")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/sponsors")
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([bannerData, sponsorData]) => {
      if (Array.isArray(bannerData)) setBanners(bannerData);
      if (Array.isArray(sponsorData)) setSponsors(sponsorData);
    });
  }, []);

  const clubAd = banners[0];
  const partnerAd = sponsors[0] || banners[1];

  return (
    <>
      {/* LEFT SIDEBAR: CLUB PROMOTIONS (Visible on 2XL screens) */}
      <aside className="hidden 2xl:block fixed left-4 top-24 w-44 z-30 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-[1.75rem] border border-border bg-card/95 backdrop-blur-xl p-3 shadow-2xl space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-pitch flex items-center gap-1">
              <Megaphone className="h-3 w-3" /> Club Hub
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-pitch animate-pulse" />
          </div>

          <a
            href={clubAd?.linkUrl || "/tournament-hub"}
            className="block group relative rounded-xl overflow-hidden aspect-[9/16] bg-muted border border-border shadow-inner"
          >
            {clubAd?.imageUrl ? (
              <img
                src={clubAd.imageUrl}
                alt="Club Promotion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full p-4 flex flex-col justify-between text-center bg-gradient-to-b from-pitch/10 to-transparent">
                <Sparkles className="h-6 w-6 text-pitch mx-auto mt-4" />
                <p className="text-[11px] font-black uppercase text-foreground leading-tight">
                  Season Registrations Open
                </p>
                <span className="text-[9px] font-bold text-pitch uppercase underline">
                  Join Now →
                </span>
              </div>
            )}
          </a>
        </motion.div>
      </aside>

      {/* RIGHT SIDEBAR: COMMERCIAL SPONSORS (Visible on 2XL screens) */}
      <aside className="hidden 2xl:block fixed right-4 top-24 w-44 z-30 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="rounded-[1.75rem] border border-border bg-card/95 backdrop-blur-xl p-3 shadow-2xl space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-gold flex items-center gap-1">
              <Award className="h-3 w-3" /> Partner
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          </div>

          <a
            href={partnerAd?.websiteUrl || partnerAd?.linkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block group relative rounded-xl overflow-hidden aspect-[9/16] bg-muted border border-border shadow-inner"
          >
            {partnerAd?.logoUrl || partnerAd?.imageUrl ? (
              <img
                src={partnerAd.logoUrl || partnerAd.imageUrl}
                alt="Partner Advertisement"
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full p-4 flex flex-col justify-between text-center bg-gradient-to-b from-gold/10 to-transparent">
                <Award className="h-6 w-6 text-gold mx-auto mt-4" />
                <p className="text-[11px] font-black uppercase text-foreground leading-tight">
                  Official Sponsor Partner
                </p>
                <span className="text-[9px] font-bold text-gold uppercase flex items-center justify-center gap-1">
                  Visit Partner <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </div>
            )}
          </a>
        </motion.div>
      </aside>
    </>
  );
}
