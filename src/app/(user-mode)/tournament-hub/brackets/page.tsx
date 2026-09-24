import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";

export default async function PublicBracketsPage() {
  const activeSeason = await prisma.season.findFirst({ where: { status: "ACTIVE" } });
  if (!activeSeason) return <div className="py-20 text-center font-bold">No Active Season</div>;

  const [standings, nodes] = await Promise.all([
    prisma.standing.findMany({
      where: { seasonId: activeSeason.id },
      include: { team: true },
      orderBy: [{ points: "desc" }, { goalDiff: "desc" }],
      take: 4
    }),
    prisma.bracketMatch.findMany({
      where: { bracket: { seasonId: activeSeason.id } },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
      orderBy: [{ round: "asc" }, { slotIndex: "asc" }]
    })
  ]);

  // Map nodes for the pathway
  const q1 = nodes.find(n => n.label?.includes("Qualifier 1"));
  const elim = nodes.find(n => n.label?.includes("Eliminator"));
  const q2 = nodes.find(n => n.label?.includes("Qualifier 2"));
  const final = nodes.find(n => n.label?.includes("Final"));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-16 min-h-screen">
      <Link href="/tournament-hub" className="inline-flex items-center gap-2 text-muted-foreground hover:text-pitch font-black uppercase text-xs transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Hub
      </Link>

      <div className="grid lg:grid-cols-4 gap-10">
        
        {/* COLUMN 1: TOP 4 STANDINGS */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase italic border-l-4 border-pitch pl-3">League Stage Top 4</h2>
          <div className="border-2 rounded-[2rem] overflow-hidden bg-card shadow-sm">
            <Table>
              <TableBody>
                {standings.map((s, i) => (
                  <TableRow key={s.id} className="border-b last:border-0 h-20">
                    <TableCell className="font-black text-pitch text-lg pl-6">{i + 1}</TableCell>
                    <TableCell className="font-bold flex items-center gap-3 py-6">
                      {s.team.logoUrl ? <img src={s.team.logoUrl} className="h-10 w-10 rounded-full border shadow-sm bg-white" /> : <div className="h-10 w-10 rounded-full bg-muted" />}
                      <span className="truncate uppercase text-xs">{s.team.name}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* COLUMNS 2-4: THE PATHWAY BRACKET */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-black uppercase italic border-l-4 border-sky pl-3">Road to the Championship</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-4 py-10 overflow-x-auto">
            
            {/* Step 1: Q1 & Elim */}
            <div className="flex flex-col gap-10 min-w-[280px]">
                <BracketCard node={q1} title="Qualifier 1" color="border-pitch" />
                <BracketCard node={elim} title="Eliminator" color="border-sky" />
            </div>

            <ChevronRight className="hidden md:block opacity-20 h-10 w-10" />

            {/* Step 2: Q2 */}
            <div className="min-w-[280px]">
                <BracketCard node={q2} title="Qualifier 2" color="border-gold" />
            </div>

            <ChevronRight className="hidden md:block opacity-20 h-10 w-10" />

            {/* Step 3: Final */}
            <div className="min-w-[320px] scale-110">
                <BracketCard node={final} title="Grand Final" color="border-danger" isFinal />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function BracketCard({ node, title, color, isFinal }: any) {
  const m = node?.match;
  return (
    <div className={`bg-card border-2 ${color} rounded-[2rem] overflow-hidden shadow-lg transition-transform hover:scale-[1.02]`}>
      <div className={`${color.replace('border', 'bg')} py-2 text-center`}>
        <p className="text-[10px] font-black uppercase text-white tracking-widest">{title}</p>
      </div>
      <div className="p-5 space-y-4">
        <TeamLine team={m?.homeTeam} score={m?.homeScore} />
        <div className="border-t border-dashed opacity-50" />
        <TeamLine team={m?.awayTeam} score={m?.awayScore} />
      </div>
      {isFinal && m?.status === "FINISHED" && (
        <div className="bg-gold py-2 text-center">
            <p className="text-xs font-black text-white uppercase italic flex items-center justify-center gap-2"><Trophy className="h-3 w-3" /> Champions Crowned</p>
        </div>
      )}
    </div>
  );
}

function TeamLine({ team, score }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {team?.logoUrl ? <img src={team.logoUrl} className="h-8 w-8 rounded-full border bg-white" /> : <div className="h-8 w-8 rounded-full bg-muted" />}
                <span className="font-black text-xs uppercase truncate max-w-[140px]">{team?.name || "TBD"}</span>
            </div>
            <span className="font-black text-xl tabular-nums">{score ?? "-"}</span>
        </div>
    )
}