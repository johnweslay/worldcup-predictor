export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAllMatches } from '@/lib/football-api'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let matches
  try {
    matches = await getAllMatches()
  } catch (err: any) {
    return NextResponse.json({ error: 'Football API error', detail: err.message }, { status: 500 })
  }

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
