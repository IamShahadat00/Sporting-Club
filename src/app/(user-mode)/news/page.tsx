import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function NewsPage() {
  const allNews = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const featured = allNews[0];
  const remaining = allNews.slice(1);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-pitch selection:text-white pb-20">
      {/* BACKGROUND SHAPES */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-pitch/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-pitch font-black uppercase text-[10px] tracking-[0.3em] transition-all group mb-12"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
          Return to Arena
        </Link>

        <header className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-12 bg-pitch" />
            <span className="text-pitch font-black uppercase tracking-[0.5em] text-xs">
              Official News & Announcements
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-6">
            CLUB <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-400 to-slate-800">
              Updates
            </span>
          </h1>
        </header>

        {!featured && (
          <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.02]">
            <Megaphone className="h-16 w-16 mx-auto text-slate-800 mb-6" />
            <p className="font-black uppercase tracking-widest text-slate-600">
              No announcements broadcasted yet.
            </p>
          </div>
        )}

        {featured && (
          <section className="mb-24">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pitch to-sky rounded-[4rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900 border border-white/10 rounded-[3.0rem] overflow-hidden flex flex-col lg:flex-row h-full lg:min-h-[500px]">
                <div className="flex-1 overflow-hidden relative bg-slate-800">
                  {/* IMAGE SAFETY CHECK */}
                  {featured.imageUrl && featured.imageUrl.trim() !== "" ? (
                    <img
                      src={featured.imageUrl}
                      className="w-full h-full object-fit transition-transform duration-1000 group-hover:scale-105"
                      alt={featured.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Megaphone className="h-20 w-20 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute top-8 left-6">
                    <Badge className="bg-pitch text-black font-black px-6 py-1.5 rounded-full text-xs transform -skew-x-12 shadow-2xl">
                      LATEST NEWS
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 p-15 md:p-15 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-1 text-pitch font-bold text-lg uppercase tracking-widest">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(featured.createdAt), "MMMM dd, yyyy")}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-none group-hover:text-pitch transition-colors tracking-tighter">
                    {featured.title}
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed line-clamp-4 italic font-large">
                    "{featured.content}"
                  </p>
                  <div className="pt-4">
                    {featured.linkUrl && (
                      <a
                        href={featured.linkUrl}
                        target="_blank"
                        className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-pitch transition-all shadow-xl"
                      >
                        Read Full Report <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {remaining.map((item, idx) => (
            <div key={item.id} className="flex flex-col group h-full">
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-slate-900 mb-6">
                {/* IMAGE SAFETY CHECK */}
                {item.imageUrl && item.imageUrl.trim() !== "" ? (
                  <img
                    src={item.imageUrl}
                    className="w-full h-full object-fit grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white/5" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 font-black text-[10px] px-4 py-1 rounded-full uppercase">
                    {item.type}
                  </Badge>
                </div>
              </div>

              <div className="px-4 flex-1 flex flex-col">
                <p className="text-slate-500 font-bold text-[30px] uppercase tracking-widest mb-3">
                  {format(new Date(item.createdAt), "dd MMM yyyy")}
                </p>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-pitch transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed line-clamp-3 mb-6 flex-1 font-medium">
                  {item.content}
                </p>
                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-[10px] font-black text-pitch uppercase tracking-[0.2em] group-hover:gap-4 transition-all"
                  >
                    Full Details <ChevronRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
