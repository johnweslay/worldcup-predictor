export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getMatch } from '@/lib/football-api'

// GET /api/cron/resolve
// Called by Vercel Cron (every 30 min) or manually.
// Resolves FINISHED matches and awards points to correct predictors.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 1. Find matches that are FINISHED but not yet resolved in our DB
  const { data: pending, error: fetchErr } = await supabaseAdmin
    .from('matches')
    .select('id, external_id, result')
    .eq('status', 'FINISHED')
    .is('resolved_at', null)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  if (!pending?.length) return NextResponse.json({ message: 'Nothing to resolve' })

  const log: any[] = []

  for (const match of pending) {
    // 2. Confirm result from football-data.org API
    const live = await getMatch(match.external_id)
    if (!live || live.status !== 'FINISHED' || !live.result) {
      log.push({ matchId: match.id, skip: 'not finished yet' })
      continue
    }

    const result = live.result

    // 3. Update match with official result
    await supabaseAdmin
      .from('matches')
      .update({
        result,
        home_score: live.homeScore,
        away_score: live.awayScore,
        status: 'FINISHED',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', match.id)

    // 4. Fetch all predictions for this match
    const { data: predictions } = await supabaseAdmin
      .from('predictions')
      .select('id, user_id, pick')
      .eq('match_id', match.id)
      .eq('point_awarded', false)

    let awarded = 0
    for (const pred of predictions ?? []) {
      const correct = pred.pick === result

      // 5. Mark prediction as resolved
      await supabaseAdmin
        .from('predictions')
        .update({ is_correct: correct, point_awarded: correct })
        .eq('id', pred.id)

      // 6. Award point to user if correct
      if (correct) {
        await supabaseAdmin.rpc('award_point', { p_user_id: pred.user_id })
        awarded++
      }
    }

    log.push({ matchId: match.id, result, awarded })
  }

  return NextResponse.json({ resolved: log })
}
