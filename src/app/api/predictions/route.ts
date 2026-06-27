export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).dbId
  const { matchId, pick, isStupidPick } = await req.json()

  if (!matchId || !['HOME_WIN', 'DRAW', 'AWAY_WIN'].includes(pick)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Check match
  const { data: match, error: mErr } = await supabaseAdmin
    .from('matches')
    .select('id, kickoff_at, status')
    .eq('id', matchId)
    .single()

  if (mErr || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

  const kickoff = new Date(match.kickoff_at)
  if (new Date() >= kickoff) {
    return NextResponse.json({ error: 'Predictions are locked after kick-off' }, { status: 403 })
  }

  if (!['SCHEDULED', 'TIMED'].includes(match.status)) {
    return NextResponse.json({ error: 'Match is not open for predictions' }, { status: 403 })
  }

  // Stupid Pick validations
  if (isStupidPick) {
    // Check user has at least 1 available point
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('points, locked_points')
      .eq('id', userId)
      .single()

    const available = (user?.points ?? 0) - (user?.locked_points ?? 0)
    if (available < 1) {
      return NextResponse.json({ error: 'You need at least 1 available point to use Stupid Pick' }, { status: 403 })
    }

    // Check not already used Stupid Pick for this match's day
    const matchDay = new Date(match.kickoff_at).toISOString().slice(0, 10)
    const dayStart = `${matchDay}T00:00:00.000Z`
    const dayEnd   = `${matchDay}T23:59:59.999Z`

    const { data: existingStupid } = await supabaseAdmin
      .from('predictions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_stupid_pick', true)
      .gte('created_at', dayStart)
      .lte('created_at', dayEnd)
      .limit(1)

    if (existingStupid && existingStupid.length > 0) {
      return NextResponse.json({ error: 'You can only use Stupid Pick once per day' }, { status: 403 })
    }
  }

  // Upsert prediction
  const { data: pred, error: pErr } = await supabaseAdmin
    .from('predictions')
    .upsert(
      {
        user_id:        userId,
        match_id:       matchId,
        pick,
        is_stupid_pick: isStupidPick ?? false,
        stake_locked:   isStupidPick ?? false,
      },
      { onConflict: 'user_id,match_id' }
    )
    .select()
    .single()

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // Lock 1 point if stupid pick
  if (isStupidPick) {
    await supabaseAdmin.rpc('lock_stupid_pick_point', { p_user_id: userId })
  }

  await supabaseAdmin.rpc('increment_predicted', { p_user_id: userId })

  return NextResponse.json({ prediction: pred })
}
