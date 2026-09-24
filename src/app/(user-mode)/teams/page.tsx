import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Trophy, Users, MapPin } from "lucide-react"

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { players: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-pitch-dark">Our Teams</h1>
        <p className="text-muted-foreground mt-2 font-medium">Click on a team to view their full profile and squad.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {teams.map((team) => (
          <Link href={`/teams/${team.id}`} key={team.id} className="group">
            <div className="bg-card border-2 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 transition-all group-hover:border-pitch group-hover:shadow-2xl shadow-sm">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg bg-white" />
              ) : (
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center font-black text-4xl text-muted-foreground">
                  {team.name[0]}
                </div>
              )}
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h3 className="text-3xl font-black uppercase tracking-tight">{team.name}</h3>
                  {team.titlesWon > 0 && (
                    <Badge className="bg-gold text-white border-none"><Trophy className="h-3 w-3 mr-1" /> {team.titlesWon} Titles</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-pitch" />
                      <span className="text-sm font-bold uppercase">{team.district || "Dhaka"}</span>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-pitch" />
                      <span className="text-sm font-bold uppercase">{team._count.players} Players</span>
                   </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2 italic">"{team.description || 'No description available for this team yet.'}"</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Badge({ children, className }: any) {
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${className}`}>{children}</span>
}