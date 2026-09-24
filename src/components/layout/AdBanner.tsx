"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AdBanner() {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then(setBanners);
    const interval = setInterval(
      () => {
        fetch("/api/banners")
          .then((r) => r.json())
          .then(setBanners); // re-checks every 5 min in case window just opened/closed
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {banners.map((banner) => {
        // FIX: Skip rendering if the URL is empty
        if (!banner.imageUrl || banner.imageUrl.trim() === "") return null;

        return (
          <motion.a
            key={banner.id}
            href={banner.linkUrl ?? "#"}
            // ... animation props ...
            className="block w-full overflow-hidden"
          >
            <img
              src={banner.imageUrl}
              alt="Sponsor banner"
              className="w-full max-h-24 object-cover"
            />
          </motion.a>
        );
      })}
    </AnimatePresence>
  );
}
