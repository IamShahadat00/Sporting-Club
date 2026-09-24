import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Called every minute by Vercel Cron. Flips any SCHEDULED match whose
// kickoff time has arrived over to LIVE — this is the "starts itself at 8pm" behavior.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const started = await prisma.match.updateMany({
    where: { status: "SCHEDULED", scheduledStart: { lte: now } },
    data: { status: "LIVE", actualStart: now },
  })

  return NextResponse.json({ startedCount: started.count, checkedAt: now })
}