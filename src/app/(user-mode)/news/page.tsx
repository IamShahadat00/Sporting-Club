import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Megaphone,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

export default async function NewsPage() {
  const allNews = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const featured = allNews[0];
  const remaining = allNews.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        <BackButton fallbackHref="/" label="Return to Arena" />

        <header className="space-y-2">
          <span className="text-pitch font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">
            Official Club Bulletins
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground">
            NEWS & <span className="text-pitch">UPDATES</span>
          </h1>
        </header>

        {!featured && (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-black uppercase tracking-widest text-muted-foreground text-xs">
              No bulletins published yet.
            </p>
          </div>
        )}

        {featured && (
          <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col lg:flex-row">
            <div className="flex-1 aspect-video lg:aspect-auto min-h-[260px] relative bg-muted">
              {featured.imageUrl && featured.imageUrl.trim() !== "" ? (
                <img
                  src={featured.imageUrl}
                  className="w-full h-full object-cover"
                  alt={featured.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <Megaphone className="h-16 w-16" />
                </div>
              )}
            </div>

            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-2 text-pitch font-bold text-xs uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(featured.createdAt), "MMMM dd, yyyy")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic leading-tight text-foreground">
                {featured.title}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3">
                &quot;{featured.content}&quot;
              </p>
              {featured.linkUrl && (
                <div className="pt-2">
                  <a
                    href={featured.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-pitch hover:bg-pitch-dark text-white px-5 py-2.5 rounded-xl font-black uppercase text-xs shadow-md transition-all"
                  >
                    Read Full Story <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {remaining.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="aspect-video relative bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Sparkles className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5">
                  <Badge className="bg-background/90 text-foreground border-border text-[9px] uppercase font-black">
                    {item.type}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">
                    {format(new Date(item.createdAt), "dd MMM yyyy")}
                  </p>
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs line-clamp-3 mt-1.5 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {item.linkUrl && (
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-pitch uppercase tracking-wider pt-2 hover:underline"
                  >
                    View Details <ChevronRight className="h-3.5 w-3.5" />
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
