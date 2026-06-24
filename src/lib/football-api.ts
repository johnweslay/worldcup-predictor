import axios from 'axios'

const api = axios.create({
  baseURL: process.env.FOOTBALL_API_BASE,
  headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY },
})

const COMPETITION = process.env.WORLD_CUP_COMPETITION_ID || '2000'

// Country ISO → emoji flag map (extend as needed)
const FLAG: Record<string, string> = {
  BRA:'🇧🇷', ARG:'🇦🇷', FRA:'🇫🇷', ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', GER:'🇩🇪',
  JPN:'🇯🇵', ESP:'🇪🇸', POR:'🇵🇹', NED:'🇳🇱', BEL:'🇧🇪',
  URU:'🇺🇾', MEX:'🇲🇽', USA:'🇺🇸', SEN:'🇸🇳', GHA:'🇬🇭',
  MAR:'🇲🇦', CRO:'🇭🇷', SRB:'🇷🇸', SUI:'🇨🇭', CMR:'🇨🇲',
  KOR:'🇰🇷', AUS:'🇦🇺', IRN:'🇮🇷', QAT:'🇶🇦', ECU:'🇪🇨',
  POL:'🇵🇱', TUN:'🇹🇳', CAN:'🇨🇦', WAL:'🏴󠁧󠁢󠁷󠁬󠁳󠁿', DEN:'🇩🇰',
}

export interface ApiMatch {
  id: string
  stage: string
  group: string | null
  kickoff: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  status: string
  result: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | null
  homeScore: number | null
  awayScore: number | null
}

function mapResult(score: any, status: string): 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | null {
  if (status !== 'FINISHED') return null
  const h = score?.fullTime?.home ?? 0
  const a = score?.fullTime?.away ?? 0
  if (h > a) return 'HOME_WIN'
  if (a > h) return 'AWAY_WIN'
  return 'DRAW'
}

function mapMatch(m: any): ApiMatch {
  const tla = m.homeTeam?.tla ?? ''
  return {
    id:        String(m.id),
    stage:     m.stage ?? '',
    group:     m.group ?? null,
    kickoff:   m.utcDate,
    homeTeam:  m.homeTeam?.name ?? 'TBD',
    awayTeam:  m.awayTeam?.name ?? 'TBD',
    homeFlag:  FLAG[m.homeTeam?.tla ?? ''] ?? '🏳️',
    awayFlag:  FLAG[m.awayTeam?.tla ?? ''] ?? '🏳️',
    status:    m.status,
    result:    mapResult(m.score, m.status),
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
  }
}

// Fetch today's World Cup matches
export async function getTodayMatches(): Promise<ApiMatch[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await api.get(
    `/competitions/${COMPETITION}/matches`,
    { params: { dateFrom: today, dateTo: today } }
  )
  return (data.matches ?? []).map(mapMatch)
}

// Fetch all matches (for syncing DB)
export async function getAllMatches(): Promise<ApiMatch[]> {
  const { data } = await api.get(`/competitions/${COMPETITION}/matches`)
  return (data.matches ?? []).map(mapMatch)
}

// Fetch a single match result (for resolving predictions)
export async function getMatch(externalId: string): Promise<ApiMatch | null> {
  try {
    const { data } = await api.get(`/matches/${externalId}`)
    return mapMatch(data)
  } catch { return null }
}
