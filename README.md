# ⚽ World Cup Predictor

Free-to-play FIFA World Cup match prediction site. Log in with Twitter/X, predict match results (Home Win · Draw · Away Win), earn points for correct predictions, and exchange 3 points for a guaranteed whitelist spot — stored on-chain.

---

## 🗂 Project structure

```
worldcup-predictor/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Login / home screen
│   │   ├── predict/page.tsx            ← Daily matches + prediction UI
│   │   ├── points/page.tsx             ← Points tracker + leaderboard
│   │   ├── whitelist/page.tsx          ← Whitelist claim page
│   │   └── api/
│   │       ├── auth/[...nextauth]/     ← Twitter OAuth
│   │       ├── matches/                ← Today's matches (with user picks)
│   │       ├── predictions/            ← Submit a prediction
│   │       ├── points/leaderboard/     ← Leaderboard data
│   │       ├── whitelist/              ← Claim whitelist
│   │       └── cron/
│   │           ├── sync-matches/       ← Pull fixtures from football-data.org
│   │           └── resolve/            ← Award points after match ends
│   ├── components/
│   │   ├── MatchCard.tsx               ← Individual match prediction card
│   │   └── NavBar.tsx                  ← Top nav with points badge
│   └── lib/
│       ├── auth.ts                     ← NextAuth config
│       ├── supabase.ts                 ← Supabase client (public + admin)
│       ├── football-api.ts             ← football-data.org API wrapper
│       └── contract.ts                 ← Ethers.js whitelist contract calls
├── contracts/
│   ├── Whitelist.sol                   ← Smart contract (Solidity)
│   └── deploy.js                       ← Hardhat deploy script
└── supabase/migrations/
    ├── 001_initial_schema.sql          ← All tables + RLS policies
    └── 002_functions.sql               ← RPC functions (award_point, claim_whitelist…)
```

---

## 🚀 Setup guide (step by step)

### 1 — Clone & install

```bash
git clone <your-repo>
cd worldcup-predictor
npm install
cp .env.local.example .env.local
```

---

### 2 — Twitter / X OAuth

1. Go to [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App → enable **OAuth 2.0**
3. Set callback URL: `http://localhost:3000/api/auth/callback/twitter`
4. Copy **Client ID** and **Client Secret** into `.env.local`

```env
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
```

---

### 3 — Supabase database

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run both migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
3. Copy your project URL and keys from **Settings → API**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

### 4 — Football Data API

1. Sign up free at [football-data.org](https://www.football-data.org/)
2. Copy your API key

```env
FOOTBALL_API_KEY=...
FOOTBALL_API_BASE=https://api.football-data.org/v4
WORLD_CUP_COMPETITION_ID=2000
```

3. Sync all World Cup fixtures into your DB (run once):

```bash
curl -H "x-cron-secret: YOUR_CRON_SECRET" http://localhost:3000/api/cron/sync-matches
```

---

### 5 — Smart contract (Ethereum)

Install Hardhat dependencies:

```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox dotenv
```

Deploy to **Sepolia testnet** first:

```bash
npx hardhat run contracts/deploy.js --network sepolia
```

Then mainnet when ready:

```bash
npx hardhat run contracts/deploy.js --network mainnet
```

Copy the printed contract address:

```env
WHITELIST_CONTRACT_ADDRESS=0x...
BLOCKCHAIN_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
DEPLOYER_PRIVATE_KEY=0x...   # ⚠️  NEVER commit this
```

---

### 6 — Run locally

```bash
# Generate a random NEXTAUTH_SECRET:
openssl rand -base64 32

npm run dev
# → http://localhost:3000
```

---

### 7 — Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add all `.env.local` variables in **Vercel → Settings → Environment Variables**.

Vercel will automatically run the two cron jobs defined in `vercel.json`:
- **`/api/cron/sync-matches`** — daily at 06:00 UTC (pulls new fixtures)
- **`/api/cron/resolve`** — every 30 min (resolves finished matches, awards points)

Protect crons by setting `CRON_SECRET` and adding it as a Vercel env var.

---

## 🎮 How the game works

| Action | Result |
|--------|--------|
| Sign in with Twitter | Account created in DB |
| Pick Home Win / Draw / Away Win | Prediction locked at kick-off |
| Match finishes | Cron resolves result via football-data.org |
| Correct prediction | +1 point awarded automatically |
| 3 points accumulated | Whitelist claim button unlocks |
| Enter wallet + claim | 3 pts deducted, wallet added on-chain |

---

## 🔒 Security notes

- `DEPLOYER_PRIVATE_KEY` must stay secret — never commit it
- All point operations go through Supabase RPC functions (atomic, not manipulable from client)
- Cron endpoints require `x-cron-secret` header
- Predictions lock server-side at kick-off time (not just client-side)
- One prediction per user per match enforced by DB unique constraint

---

## 📄 License

MIT
