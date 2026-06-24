export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/matches
// Returns today's matches + the authed user's existing predictions
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).dbId

  // Today's date range (UTC)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setUTCHours(23, 59, 59, 999)

  // Fetch today's matches
  const { data: matches, error: mErr } = await supabaseAdmin
    .from('matches')
    .select('*')
    .gte('kickoff_at', todayStart.toISOString())
    .lte('kickoff_at', todayEnd.toISOString())
    .order('kickoff_at', { ascending: true })

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

  // Fetch user's predictions for these matches
  const matchIds = (matches ?? []).map((m: any) => m.id)
  let predictions: any[] = []
  if (matchIds.length > 0) {
    const { data: preds } = await supabaseAdmin
      .from('predictions')
      .select('match_id, pick, is_correct, point_awarded')
      .eq('user_id', userId)
      .in('match_id', matchIds)
    predictions = preds ?? []
  }

  // Merge predictions into matches
  const predMap = Object.fromEntries(predictions.map((p: any) => [p.match_id, p]))
  const result = (matches ?? []).map((m: any) => ({
    ...m,
    userPrediction: predMap[m.id] ?? null,
  }))

  return NextResponse.json({ matches: result })
}
