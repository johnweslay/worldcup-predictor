export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/whitelist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).dbId
  const { walletAddress } = await req.json()

  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { data: user, error: uErr } = await supabaseAdmin
    .from('users')
    .select('points, wl_claimed')
    .eq('id', userId)
    .single()

  if (uErr || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.wl_claimed) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })
  if (user.points < 3) {
    return NextResponse.json(
      { error: `Not enough points. You have ${user.points}/3.` },
      { status: 403 }
    )
  }

  // Deduct 3 points and mark wl_claimed
  const { error: rpcErr } = await supabaseAdmin.rpc('claim_whitelist', {
    p_user_id: userId,
    p_wallet:  walletAddress,
  })
  if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 })

  // Store in whitelist table
  await supabaseAdmin.from('whitelist').upsert({
    user_id:        userId,
    wallet_address: walletAddress,
    on_chain:       false,
  })

  return NextResponse.json({ success: true, walletAddress })
}

// GET /api/whitelist
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).dbId
  const { data } = await supabaseAdmin
    .from('whitelist')
    .select('wallet_address, created_at')
    .eq('user_id', userId)
    .single()

  return NextResponse.json({ entry: data ?? null })
}
