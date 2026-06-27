export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).dbId

  // Show next 4 days of matches (UTC)
  const windowStart = new Date()
  windowStart.setUTCHours(0, 0, 0, 0)
  const windowEnd = new Date(windowStart)
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 4)
  windowEnd.setUTCHours(23, 59, 59, 999)

  const { data: matches, error: mErr } = await supabaseAdmin
    .from('matches')
    .select('*')
    .gte('kickoff_at', windowStart.toISOString())
    .lte('kickoff_at', windowEnd.toISOString())
    .order('kickoff_at', { ascending: true })

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

  const matchIds = (matches ?? []).map((m: any) => m.id)
  let predictions: any[] = []
  if (matchIds.length > 0) {
    const { data: preds } = await supabaseAdmin
      .from('predictions')
      .select('match_id, pick, is_correct, point_awarded, is_stupid_pick')
      .eq('user_id', userId)
      .in('match_id', matchIds)
    predictions = preds ?? []
  }

  const predMap = Object.fromEntries(predictions.map((p: any) => [p.match_id, p]))
  const result = (matches ?? []).map((m: any) => ({
    ...m,
    userPrediction: predMap[m.id] ?? null,
  }))

  return NextResponse.json({ matches: result })
}
