"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function SeasonBanner({ season }: { season: any }) {
  return (
    <div className="relative h-64 sm:h-80 w-full overflow-hidden">
      {season.bannerImageUrl ? (
        <Image src={season.bannerImageUrl} alt={season.name} fill priority className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-dark to-sky" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-gold">Active season</span>
        <h1 className="text-3xl sm:text-5xl font-black mt-1">{season.name}</h1>
      </motion.div>
    </div>
  )
}