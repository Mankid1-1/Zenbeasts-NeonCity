# Zenbeasts: Neon Dynasty — Target Architecture

This document is the north star for the in-progress refactor. It captures the
decisions that have been made, the ones still open, and the phased migration
plan. The **game design is not changing** — minting, breeding, battling,
staking, and trading AI-generated cyberpunk monk NFTs all stay. What changes
is *how* the system is built so it can be secure, multiplayer, and on-chain
instead of a single-player browser simulation.

## 1. Why we're refactoring

The current architecture collapses every concern into the React client:

- **API keys ship to the browser.** Gemini, Stability AI, and Blink keys are
  read via `import.meta.env` in client modules. Anyone can grab them from the
  bundle. `.env.local` was even committed to git.
- **localStorage is the database.** That makes "marketplace", "leaderboards",
  and PvP structurally impossible — every player is in their own private
  universe.
- **Battle and breeding logic runs client-side.** Anyone with DevTools wins
  every fight. Fine for a demo, fatal for play-to-earn.
- **Web3 is fully simulated.** No real ERC-721, no real wallet, no real ZEN
  token. The whole economic premise is unlanded.
- **`hooks/useGameState.ts` is 599 lines.** Symptom of having no domain layer:
  every concern piles into one hook.
- **TypeScript is decorative** (no `strict: true`, ~38 `any` casts).

The good news: the *content* layer (Gemini prompts in `prompts.ts`, the
hashlips trait config, the game-balance constants, the beast taxonomy) is
solid and portable. None of it has to be rewritten — it just needs to live
behind a server boundary instead of in front of one.

## 2. Decisions

| # | Decision | Rationale |
| - | -------- | --------- |
| D1 | **Stay on Vite + React for v1**, do not migrate to Next.js yet. | Smaller blast radius. Add a backend-for-frontend (BFF) on Cloudflare Workers; revisit Next.js after the BFF is stable so SSR/RSC become an add-on rather than a rewrite. |
| D2 | **BFF: Cloudflare Workers + Hono.** | Cheap, fast cold starts, JS-native, no infra. All AI/Gemini/Stability calls move there. |
| D3 | **DB: Neon Postgres + Drizzle ORM.** | Serverless-friendly, real schema, transactions. Replaces localStorage as source of truth. |
| D4 | **Auth: SIWE (Sign-In With Ethereum) via wagmi + viem.** | Wallet *is* identity. No separate username/password layer to secure. |
| D5 | **Web3 chain: EVM (Base Sepolia for testnet, Base for mainnet).** | Richer NFT tooling than Solana, cheap L2 fees, OpenSea support out of the box. The current `Wallet.chain` union (`'solana' \| 'polygon'`) gets narrowed to EVM only. |
| D6 | **Smart contracts: Foundry, ERC-721 (ZenBeast) + ERC-20 (ZEN).** | Standard, audited primitives. Indexed off-chain via Ponder. |
| D7 | **State: Zustand for UI state, TanStack Query for server state, Zod for every boundary.** | Replaces the 599-line god-hook with bounded, cacheable, validated state. |
| D8 | **Beast art: hybrid — pre-render Gen-0 with HashLips CLI, dynamic browser composite for breed/evolve.** | Gen-0 is the canonical NFT collection; breed/evolve produce novel offspring that can't be pre-rendered. Both write final PNGs to R2 + CDN. |
| D9 | **UI: Tailwind 4 + shadcn/ui (radix already a dep).** | Free a11y / keyboard nav / ARIA — fixes the existing `*A11y.test.tsx` failures. |
| D10 | **Single repo, no Turborepo for v1.** | Pre-mature monorepo is overhead. Promote to monorepo when contracts + indexer + web become independently deployable. |
| D11 | **Server-authoritative gameplay.** | Battle/breed/evolve resolution moves to the BFF. Client only animates. Anti-cheat by construction. |
| D12 | **Domain modules.** Code is grouped by *what part of the game* it implements, not by *what kind of file* it is. | See §4. |

Decisions D2–D6 are reversible (we can switch L2s, swap Hono for tRPC, etc.)
but the *shape* of the architecture (BFF + DB + on-chain + indexer) is what
matters and is independent of those choices.

## 3. Target stack at a glance

| Concern              | Now                              | Target                                                       |
| -------------------- | -------------------------------- | ------------------------------------------------------------ |
| Framework            | React 18 + Vite + HashRouter     | React 19 + Vite + BrowserRouter                              |
| Backend              | None                             | Cloudflare Workers + Hono                                    |
| API key handling     | Client-side `import.meta.env`    | Worker-only; client never sees keys                          |
| State                | 599-line `useGameState`          | Zustand (UI) + TanStack Query (server)                       |
| Persistence          | localStorage                     | Neon Postgres + Drizzle                                      |
| Auth                 | Fake wallet                      | SIWE via wagmi                                               |
| Web3                 | Simulated                        | wagmi + viem; ERC-721 on Base Sepolia                        |
| Indexer              | None                             | Ponder                                                       |
| AI proxy             | Direct from browser              | `/api/ai/*` route handlers, rate-limited, cached, schema-validated |
| Beast art            | Stability AI per-beast OR picsum | HashLips compositor → R2/S3 + CDN                            |
| Validation           | Hope                             | Zod at every boundary                                        |
| UI primitives        | Custom glassmorphism             | shadcn/ui + Tailwind                                         |
| Testing              | Vitest only                      | Vitest (unit) + Playwright (e2e — already a dep) + Foundry (contracts) |
| Observability        | console.log                      | Sentry + OTEL (deps already imported, unused)                |

## 4. Target source layout

```
zenbeasts-neoncity/
├── apps/                       (only if/when we promote to a monorepo)
├── docs/
│   ├── architecture.md         (this file)
│   └── migration-checklist.md
├── src/
│   ├── app/                    React routes / pages
│   ├── components/             Pure UI; no game logic, no fetching
│   ├── domain/                 Bounded contexts — each one owns its types,
│   │   ├── beasts/             schemas, server functions, and React hooks.
│   │   ├── battle/
│   │   ├── breeding/
│   │   ├── staking/
│   │   ├── marketplace/
│   │   ├── economy/
│   │   └── wallet/
│   ├── server/                 Cloudflare Worker entrypoints
│   │   ├── ai/                 Gemini + Stability proxies
│   │   ├── db/                 Drizzle schema + queries
│   │   └── routes/             Hono routes
│   ├── lib/                    Cross-cutting helpers (zod, fetch, time)
│   └── styles/
├── contracts/                  Foundry project
│   ├── src/ZenBeast.sol
│   ├── src/ZEN.sol
│   └── test/
├── indexer/                    Ponder project
└── tests/                      Vitest unit + Playwright e2e
```

A domain module looks like:

```
src/domain/beasts/
├── schemas.ts        Zod schemas — single source of truth for shape
├── types.ts          Types derived from schemas via z.infer
├── generation.ts     Pure functions: trait selection, rarity scoring
├── server.ts         Server-only logic (called from worker routes)
├── api.ts            Client-side fetcher (calls /api/beasts/*)
├── hooks.ts          React hooks (TanStack Query wrappers)
└── index.ts          Barrel export
```

The 599-line `useGameState` hook decomposes into `useBeasts`, `useMarketplace`,
`useStaking`, `useBattle`, `useBreeding`, `useWallet` — each ~80 lines and
testable in isolation.

## 5. Phased migration plan

### Phase 0 — Stabilize (1–2 days) — *in progress*
Pure wins, do regardless of any redesign.
- [x] `.env.local` removed from git, added to `.gitignore`
- [x] One lock file (kept `package-lock.json`, removed `pnpm-lock.yaml`)
- [x] `tailwindcss` + `autoprefixer` added as devDeps so the build works
- [x] `ErrorBoundary` wraps `<Routes>` in `App.tsx`
- [x] `zod` installed
- [ ] `tsconfig.json` strict mode — deferred (will enable per-file via `// @ts-strict` opt-in then promote globally once each file is clean)
- [ ] Rotate Blink credentials — **user action required**

### Phase 1 — BFF + AI proxy (1 week)
- [ ] Cloudflare Worker scaffold with Hono router
- [ ] `/api/ai/generate-beast` — wraps Gemini + hashlips compositor; Zod-validated
- [ ] `/api/ai/breed`, `/api/ai/evolve`, `/api/ai/battle` — same pattern
- [ ] `services/geminiService.ts` becomes a thin client that calls the worker; client-side API key reads deleted
- [ ] Per-IP rate limit (Upstash Redis) on AI endpoints
- [ ] Response cache (R2 or Upstash) keyed by trait hash to dedupe Stable Diffusion calls

### Phase 2 — Real persistence (1 week)
- [x] First domain module carved out (`domain/beasts/`) — pattern proven
- [ ] Neon Postgres + Drizzle setup; tables: `users`, `beasts`, `marketplace_listings`, `battles`, `staking_positions`, `quests`, `achievements_progress`
- [ ] Migrate `useGameState` → domain hooks (TanStack Query against worker endpoints)
- [ ] localStorage relegated to ephemeral UI state (theme, last-viewed tab)

### Phase 3 — Server-authoritative gameplay (1–2 weeks)
- [ ] Battle resolution runs in worker, not client
- [ ] Breed/evolve resolution runs in worker
- [ ] Server-signed reward grants (no client can mint coins out of thin air)
- [ ] Optional: SSE for live battle log streaming

### Phase 4 — Real Web3 (2–3 weeks)
- [ ] Foundry project; deploy `ZenBeast` (ERC-721) + `ZEN` (ERC-20) on Base Sepolia
- [ ] SIWE replaces fake wallet flow; wagmi + viem wired into `domain/wallet/`
- [ ] Ponder indexer: mirrors on-chain mints/transfers into Postgres
- [ ] Real `claim()`: server signs allowance, user calls contract to mint ZEN at 1:100 ZC ratio

### Phase 5 — Production hardening (ongoing)
- [ ] Sentry + OTEL spans on AI calls (cost & latency dashboards)
- [ ] Playwright e2e in CI on critical flows (mint → breed → list → buy)
- [ ] Foundry tests on contract changes
- [ ] Pre-render Gen-0 collection (10K) via the upstream HashLips CLI; upload to R2; mint contract reveals from the static set

### Phase 6 — Optional Next.js migration
Only if SSR / share-link OG images / streaming RSC become worth the rewrite.
By this point the BFF is independent of the frontend, so the migration is
just changing how routes render — no logic moves.

## 6. Open questions

- **Pre-render scope of Gen-0.** 10,000 (canonical) vs. 1,000 (cheaper)?
- **Soul-bound starter beasts on-chain?** Either mint as non-transferable
  ERC-721 (ERC-5192) or keep starters off-chain entirely.
- **Marketplace fee destination.** Treasury wallet vs. burn vs. staker reward
  pool.
- **Breeding cooldowns.** Currently none — exploitable. Add per-beast cooldown
  (timestamp on row in Postgres).
- **Storage of trait→PNG layer art.** Ship in `public/layers/` (current scaffold)
  vs. host on R2. R2 wins for breed/evolve so the worker can composite
  server-side too.

## 7. What's NOT changing

- Game design (mint/breed/battle/stake/trade)
- Trait taxonomy (`hashlips_config.json`)
- Class roster (`BeastClass` enum)
- Rarity tiers (`Rarity` enum)
- Gemini prompt templates (`prompts.ts`)
- Soft/hard currency split (ZenCoins / ZEN, 1:100)
- Staking APY model
- Cyberpunk visual direction

If any of those need to change, that's a product decision separate from this
refactor.
