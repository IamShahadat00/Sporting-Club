"use client";

import Link from "next/link";
import { Trophy, Mail, MapPin, ArrowRight, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
        {/* 1. Introduction */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-black text-2xl italic uppercase tracking-tighter text-pitch">
            <Trophy className="h-7 w-7" />
            BADC sporting Club
          </div>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            The official sporting organization of BADC. Dedicated to fostering
            football talent, organizing professional tournaments, and building a
            stronger community through elite competition at the BADC Arena.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="https://www.facebook.com/badcsc"
              target="_blank"
              className="p-3 rounded-xl bg-white/5 hover:bg-pitch hover:text-black transition-all group"
            >
              {/* Custom Facebook SVG to avoid lucide errors */}
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.656 10.995 9 11.888v-8.41h-3.047v-3.478h3.047v-2.651c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.209h3.328l-.532 3.478h-2.796v8.41c5.344-.893 9-5.898 9-11.888z" />
              </svg>
            </a>
            <a
              href="mailto:badcsportingclub@gmail.com"
              className="p-3 rounded-xl bg-white/5 hover:bg-pitch hover:text-black transition-all"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* 2. Quick Links */}
        <div>
          <h4 className="font-black uppercase text-[11px] tracking-[0.3em] text-white/40 mb-8">
            Navigation
          </h4>
          <ul className="space-y-4">
            {[
              "Tournament Hub",
              "Match Center",
              "Hall of Fame",
              "Teams",
              "Players",
            ].map((link) => (
              <li key={link}>
                <Link
                  href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                  className="text-slate-400 hover:text-pitch transition-all text-sm font-bold flex items-center group"
                >
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-pitch" />
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Address Section */}
        <div>
          <h4 className="font-black uppercase text-[11px] tracking-[0.3em] text-white/40 mb-8">
            Connect With us
          </h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-pitch/10 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-pitch" />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-bold">
                BADC Staff Quarter, <br />
                Playground Section, <br />
                Dhaka, Bangladesh.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-pitch/10 p-2 rounded-lg">
                <Globe className="h-5 w-5 text-pitch" />
              </div>
              <p className="text-slate-300 text-sm font-bold truncate">
                badcsportingclub@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* 4. Map Section */}
        <div className="h-56 w-full rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-2xl relative group">
          <div className="absolute inset-0 bg-pitch/10 pointer-events-none group-hover:opacity-0 transition-opacity z-10" />
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d406.57238598524566!2d90.35198924950744!3d23.7866948522451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c1bfbc34aa2b%3A0x411fecc1d4ae976d!2sBADC%20Playground!5e0!3m2!1sen!2sbd!4v1784191157876!5m2!1sen!2sbd"
            width="100%"
            height="100%"
            style={{
              border: 0,
              filter: "grayscale(1) invert(0.9) contrast(1.2)",
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.5em] text-slate-600">
        <p>
          © {new Date().getFullYear()} BADC Sporting Club · All Rights Reserved
        </p>
        <div className="flex gap-6">
          <span className="text-pitch opacity-50">Excellence</span>
          <span>Integrity</span>
          <span className="text-pitch opacity-50">Passion</span>
        </div>
      </div>
    </footer>
  );
}
