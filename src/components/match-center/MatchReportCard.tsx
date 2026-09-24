import { MvpCard } from "@/components/match-center/MvpCard"
import { FileText } from "lucide-react"

export function MatchReportCard({ match }: { match: any }) {
  if (!match.report && !match.mvpAward) return null

  return (
    <div className="space-y-4">
      {match.report && (
        <div className="rounded-xl border p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wide">
            <FileText className="h-4 w-4" /> Match report
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line">{match.report}</p>
        </div>
      )}
      {match.mvpAward && <MvpCard mvpAward={match.mvpAward} />}
    </div>
  )
}