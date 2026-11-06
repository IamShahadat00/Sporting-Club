"use client";

import { useEffect, useState } from "react";
import { Shield, Briefcase, Quote } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function DirectorsPage() {
  const [directors, setDirectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/directors")
      .then((r) => r.json())
      .then((data) => {
        setDirectors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-6">
        <BackButton fallbackHref="/" label="Return to Arena" />

        <div className="text-center py-8 sm:py-12 space-y-2">
          <Shield className="h-12 w-12 mx-auto text-pitch mb-2" />
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-foreground">
            THE <span className="text-pitch">BOARD</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.25em]">
            Architects of BADC Sporting Excellence
          </p>
        </div>

        <div className="space-y-12 sm:space-y-16">
          {directors.map((director, index) => (
            <div
              key={director.id}
              className={`bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="w-full sm:w-60 aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
                {director.photoUrl ? (
                  <img
                    src={director.photoUrl}
                    alt={director.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-4xl text-muted-foreground">
                    {director.name?.[0]}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase text-pitch tracking-widest">
                  {director.designation}
                </span>

                <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight text-foreground">
                  {director.name}
                </h2>

                {director.profession && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-500 text-xs font-bold uppercase">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{director.profession}</span>
                  </div>
                )}

                <div className="bg-muted/30 p-4 rounded-xl border border-border relative">
                  <Quote className="h-5 w-5 text-pitch/30 mb-1" />
                  <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                    &quot;
                    {director.bio ||
                      "Committed to sporting excellence and community development."}
                    &quot;
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="py-20 text-center text-xs font-bold text-pitch animate-pulse uppercase tracking-wider">
              Loading Board Roster...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
