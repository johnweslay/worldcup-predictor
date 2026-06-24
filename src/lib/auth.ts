import { AuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions: AuthOptions = {
  providers: [
    TwitterProvider({
      clientId:     process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),
  ],

  callbacks: {
    async signIn({ user, profile }) {
      if (!user?.id) return false
      const twitterId     = user.id
      const twitterHandle = (profile as any)?.data?.username ?? user.name ?? ''
      const twitterName   = user.name ?? ''
      const twitterImage  = user.image ?? ''

      const { error } = await supabaseAdmin
        .from('users')
        .upsert(
          { twitter_id: twitterId, twitter_handle: twitterHandle,
            twitter_name: twitterName, twitter_image: twitterImage },
          { onConflict: 'twitter_id', ignoreDuplicates: false }
        )
      if (error) { console.error('signIn upsert error', error); return false }
      return true
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        ;(session.user as any).twitterId = token.sub
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id, twitter_handle, points, wl_claimed')
          .eq('twitter_id', token.sub)
          .single()
        if (dbUser) {
          ;(session.user as any).dbId      = dbUser.id
          ;(session.user as any).handle    = dbUser.twitter_handle
          ;(session.user as any).points    = dbUser.points
          ;(session.user as any).wlClaimed = dbUser.wl_claimed
        }
      }
      return session
    },

    async jwt({ token, account }) {
      if (account) token.accessToken = account.access_token
      return token
    },
  },

  pages: { signIn: '/', error: '/' },
  secret: process.env.NEXTAUTH_SECRET,
}
