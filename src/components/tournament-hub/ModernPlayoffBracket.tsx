"use client"
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy } from "lucide-react";

export function ModernPlayoffBracket({ nodes }: { nodes: any[] }) {
  // Map nodes to their types
  const q1 = nodes.find(n => n.label?.includes("Qualifier 1"));
  const elim = nodes.find(n => n.label?.includes("Eliminator"));
  const q2 = nodes.find(n => n.label?.includes("Qualifier 2"));
  const final = nodes.find(n => n.label?.includes("Final"));

  return (
    <div className="relative w-full py-10 overflow-x-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 min-w-[800px]">
        
        {/* Step 1: Q1 and Eliminator */}
        <div className="flex flex-col gap-20">
          <PlayoffMatch cardTitle="Qualifier 1" node={q1} color="border-pitch" />
          <PlayoffMatch cardTitle="Eliminator" node={elim} color="border-sky" />
        </div>

        <ArrowRight className="text-muted-foreground hidden md:block" />

        {/* Step 2: Qualifier 2 */}
        <div className="flex flex-col justify-center h-full">
           <PlayoffMatch cardTitle="Qualifier 2" node={q2} color="border-gold" />
        </div>

        <ArrowRight className="text-muted-foreground hidden md:block" />

        {/* Step 3: Grand Final */}
        <div className="flex flex-col justify-center h-full">
           <div className="scale-110">
                <PlayoffMatch cardTitle="Grand Final" node={final} color="border-danger" isFinal />
           </div>
        </div>
      </div>
    </div>
  );
}

function PlayoffMatch({ cardTitle, node, color, isFinal }: any) {
  const m = node?.match;
  return (
    <div className={`w-64 bg-card border-2 ${color} rounded-[1.5rem] shadow-xl overflow-hidden`}>
      <div className={`${color.replace('border', 'bg')} px-4 py-1 text-center`}>
        <span className="text-[10px] font-black uppercase text-white tracking-widest">{cardTitle}</span>
      </div>
      <div className="p-4 space-y-3">
        <TeamRow team={m?.homeTeam} score={m?.homeScore} />
        <div className="border-t border-dashed" />
        <TeamRow team={m?.awayTeam} score={m?.awayScore} />
      </div>
      {m?.status === "FINISHED" && (
        <div className="bg-muted/30 py-1 text-center text-[10px] font-bold text-muted-foreground italic">
           Match Complete
        </div>
      )}
    </div>
  );
}

function TeamRow({ team, score }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {team?.logoUrl ? (
            <img src={team.logoUrl} className="h-8 w-8 rounded-full border bg-white" />
        ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">TBD</div>
        )}
        <span className="text-sm font-black uppercase truncate max-w-[120px]">{team?.name || "TBD"}</span>
      </div>
      <span className="font-black text-lg tabular-nums">{score ?? "-"}</span>
    </div>
  );
}