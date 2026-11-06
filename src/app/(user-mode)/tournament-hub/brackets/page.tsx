import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Trophy, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default async function PublicBracketsPage() {
  const activeSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeSeason) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="text-sm text-muted-foreground font-bold">
          No active season found.
        </p>
        <div className="mt-4">
          <BackButton fallbackHref="/tournament-hub" label="Back to Hub" />
        </div>
      </div>
    );
  }

  const [standings, nodes] = await Promise.all([
    prisma.standing.findMany({
      where: { seasonId: activeSeason.id },
      include: { team: true },
      orderBy: [{ points: "desc" }, { goalDiff: "desc" }],
      take: 4,
    }),
    prisma.bracketMatch.findMany({
      where: { bracket: { seasonId: activeSeason.id } },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
      orderBy: [{ round: "asc" }, { slotIndex: "asc" }],
    }),
  ]);

  const q1 = nodes.find((n) => n.label?.includes("Qualifier 1"));
  const elim = nodes.find((n) => n.label?.includes("Eliminator"));
  const q2 = nodes.find((n) => n.label?.includes("Qualifier 2"));
  const final = nodes.find((n) => n.label?.includes("Final"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 min-h-screen">
      <BackButton
        fallbackHref="/tournament-hub"
        label="Back to Tournament Hub"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* COLUMN 1: TOP 4 STANDINGS */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-black uppercase italic border-l-4 border-pitch pl-2.5 text-foreground">
            Top 4 Qualifiers
          </h2>
          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
            <Table>
              <TableBody>
                {standings.map((s, i) => (
                  <TableRow
                    key={s.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20"
                  >
                    <TableCell className="font-black text-pitch text-sm pl-4 w-8">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-bold flex items-center gap-2.5 py-3.5">
                      {s.team.logoUrl ? (
                        <img
                          src={s.team.logoUrl}
                          className="h-7 w-7 rounded-full border border-border object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {s.team.name[0]}
                        </div>
                      )}
                      <span className="truncate uppercase text-xs text-foreground">
                        {s.team.name}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {standings.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-6 text-xs text-muted-foreground italic">
                      Standings pending matches.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* COLUMNS 2-4: BRACKET ROADMAP */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-base sm:text-lg font-black uppercase italic border-l-4 border-sky-500 pl-2.5 text-foreground">
            Road to Championship
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-4 py-4 overflow-x-auto no-scrollbar">
            {/* Step 1: Q1 & Eliminator */}
            <div className="flex flex-col gap-4 w-full md:w-[260px] shrink-0">
              <BracketCard node={q1} title="Qualifier 1" color="border-pitch" />
              <BracketCard
                node={elim}
                title="Eliminator"
                color="border-sky-500"
              />
            </div>

            <ChevronRight className="hidden md:block opacity-30 h-8 w-8 shrink-0 text-muted-foreground" />

            {/* Step 2: Q2 */}
            <div className="w-full md:w-[260px] shrink-0">
              <BracketCard
                node={q2}
                title="Qualifier 2"
                color="border-amber-500"
              />
            </div>

            <ChevronRight className="hidden md:block opacity-30 h-8 w-8 shrink-0 text-muted-foreground" />

            {/* Step 3: Grand Final */}
            <div className="w-full md:w-[280px] shrink-0">
              <BracketCard
                node={final}
                title="Grand Final"
                color="border-danger"
                isFinal
              />
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
    <div
      className={`bg-card border-2 ${color} rounded-2xl overflow-hidden shadow-sm w-full`}
    >
      <div className="bg-muted py-1.5 px-3 border-b border-border text-center">
        <p className="text-[10px] font-black uppercase text-foreground tracking-wider">
          {title}
        </p>
      </div>
      <div className="p-4 space-y-2.5">
        <TeamLine team={m?.homeTeam} score={m?.homeScore} />
        <div className="border-t border-dashed border-border" />
        <TeamLine team={m?.awayTeam} score={m?.awayScore} />
      </div>
      {isFinal && m?.status === "FINISHED" && (
        <div className="bg-amber-500 py-1.5 text-center text-black font-black text-xs uppercase flex items-center justify-center gap-1.5">
          <Trophy className="h-3 w-3" /> Champions Crowned
        </div>
      )}
    </div>
  );
}

function TeamLine({ team, score }: any) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {team?.logoUrl ? (
          <img
            src={team.logoUrl}
            className="h-6 w-6 rounded-full border border-border object-cover shrink-0"
            alt=""
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold shrink-0">
            ?
          </div>
        )}
        <span className="font-bold text-xs uppercase truncate text-foreground">
          {team?.name || "TBD"}
        </span>
      </div>
      <span className="font-black text-sm tabular-nums text-foreground">
        {score ?? "-"}
      </span>
    </div>
  );
}
