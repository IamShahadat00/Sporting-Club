import type { Match, Team, Player, Season, MvpAward, Sponsor, Banner, Director, Standing, HallOfFame, Registration, User } from "@prisma/client"

export type MatchWithTeams = Match & {
  homeTeam: Team
  awayTeam: Team
  season: Season
  mvpAward?: (MvpAward & { player: Player }) | null
}

export type StandingWithTeam = Standing & { team: Team }
export type RegistrationWithPlayer = Registration & { player: Player }
export type HallOfFameEntry = HallOfFame & { player?: Player | null }

export type SessionUser = {
  id: string
  name: string
  email: string
  role: User["role"]
}

export type { Match, Team, Player, Season, MvpAward, Sponsor, Banner, Director }