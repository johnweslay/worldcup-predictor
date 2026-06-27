export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getMatch } from '@/lib/football-api'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: pending, error: fetchErr } = await supabaseAdmin
    .from('matches')
    .select('id, external_id, result')
    .eq('status', 'FINISHED')
    .is('resolved_at', null)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  if (!pending?.length) return NextResponse.json({ message: 'Nothing to resolve' })

  const log: any[] = []

  for (const match of pending) {
    const live = await getMatch(match.external_id)
    if (!live || live.status !== 'FINISHED' || !live.result) {
      log.push({ matchId: match.id, skip: 'not finished yet' })
      continue
    }

    const result = live.result

    await supabaseAdmin
      .from('matches')
      .update({
        result,
        home_score:  live.homeScore,
        away_score:  live.awayScore,
        status:      'FINISHED',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', match.id)

    const { data: predictions } = await supabaseAdmin
      .from('predictions')
      .select('id, user_id, pick, is_stupid_pick, stake_locked, point_awarded')
      .eq('match_id', match.id)
      .eq('point_awarded', false)

    let awarded = 0
    for (const pred of predictions ?? []) {
      const correct = pred.pick === result

      if (pred.is_stupid_pick) {
        // Stupid Pick resolution
        if (correct) {
          // Win: unlock staked point + award 2 bonus points (net +2)
          await supabaseAdmin
            .from('predictions')
            .update({ is_correct: true, point_awarded: true, bonus_awarded: 2 })
            .eq('id', pred.id)
          await supabaseAdmin.rpc('resolve_stupid_pick_win', { p_user_id: pred.user_id })
          awarded++
        } else {
          // Loss: consume the locked point
          await supabaseAdmin
            .from('predictions')
            .update({ is_correct: false, point_awarded: false, bonus_awarded: 0 })
            .eq('id', pred.id)
          await supabaseAdmin.rpc('resolve_stupid_pick_loss', { p_user_id: pred.user_id })
        }
      } else {
        // Normal prediction
        await supabaseAdmin
          .from('predictions')
          .update({ is_correct: correct, point_awarded: correct })
          .eq('id', pred.id)

        if (correct) {
          await supabaseAdmin.rpc('award_point', { p_user_id: pred.user_id })
          awarded++
        }
      }
    }

    log.push({ matchId: match.id, result, awarded })
  }

  return NextResponse.json({ resolved: log })
}
