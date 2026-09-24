import { prisma } from "@/lib/prisma"
import { RegistrationForm } from "@/components/tournament-hub/RegistrationForm"

export default async function RegisterPage() {
  const activeSeason = await prisma.season.findFirst({ where: { status: "ACTIVE" } })

  if (!activeSeason) {
    return <p className="max-w-lg mx-auto py-20 text-center text-muted-foreground">Registration isn't open right now — check back when the next season is announced.</p>
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-center mb-2">Register for {activeSeason.name}</h1>
      <p className="text-sm text-muted-foreground text-center mb-8">Submit your details below — an admin will review and confirm your spot.</p>
      <RegistrationForm seasonId={activeSeason.id} />
    </div>
  )
}