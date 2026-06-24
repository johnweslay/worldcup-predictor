export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAllMatches } from '@/lib/football-api'

// GET /api/cron/sync-matches
// Run once daily (or manually) to import/update all WC fixtures from API.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const matches = await getAllMatches()
  let upserted = 0

  for (const m of matches) {
    const { error } = await supabaseAdmin
      .from('matches')
      .upsert(
        {
          external_id: m.id,
          stage:       m.stage,
          group_name:  m.group,
          kickoff_at:  m.kickoff,
          home_team:   m.homeTeam,
          away_team:   m.awayTeam,
          home_flag:   m.homeFlag,
          away_flag:   m.awayFlag,
          status:      m.status,
          result:      m.result,
          home_score:  m.homeScore,
          away_score:  m.awayScore,
        },
        { onConflict: 'external_id' }
      )
    if (!error) upserted++
  }

  return NextResponse.json({ total: matches.length, upserted })
}
