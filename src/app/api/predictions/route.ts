export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/predictions
// Body: { matchId: string, pick: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).dbId
  const { matchId, pick } = await req.json()

  if (!matchId || !['HOME_WIN', 'DRAW', 'AWAY_WIN'].includes(pick)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Check match exists and hasn't kicked off yet
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

  if (match.status !== 'SCHEDULED') {
    return NextResponse.json({ error: 'Match is not open for predictions' }, { status: 403 })
  }

  // Upsert prediction (one per user per match)
  const { data: pred, error: pErr } = await supabaseAdmin
    .from('predictions')
    .upsert(
      { user_id: userId, match_id: matchId, pick },
      { onConflict: 'user_id,match_id' }
    )
    .select()
    .single()

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // Increment total_predicted (only on first insert — handle idempotently)
  await supabaseAdmin.rpc('increment_predicted', { p_user_id: userId })

  return NextResponse.json({ prediction: pred })
}
