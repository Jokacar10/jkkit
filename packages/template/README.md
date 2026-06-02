# TON AppKit starter

Minimal Vite + React + TypeScript template that showcases the core capabilities of `@ton/appkit-react` as drop-ins:

- TonConnect wallet connection — `<TonConnectButton />`
- Live TON balance over WebSocket — `useBalance()` + `useWatchBalance()`
- Send TON (safe self-transfer demo) — `<SendTonButton />`
- Jetton list with icons + balances — `useJettons()`
- NFT grid — `useNfts()` + `<NftItem />`
- Full DEX swap UI (Omniston + DeDust fallback) — `<SwapWidget />`
- Liquid staking UI (Tonstakers) — `<StakingWidget />`

## Run

```bash
pnpm install
cp .env.example .env   # add VITE_TONCENTER_API_KEY
pnpm dev
```

Other scripts: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm preview`.

## Configure

All runtime config is in `.env` (see `.env.example`) and `src/appKit.ts`.

- **`VITE_TONCENTER_API_KEY`** — free key at <https://toncenter.com>. Required for
  Tonstakers (polls ~1×/sec); recommended for everything else.
- **`VITE_TONCONNECT_MANIFEST_URL`** — optional override. Defaults to a public
  demo manifest. For prod, host your own at `${origin}/tonconnect-manifest.json`
  (placeholder is in `public/`).

## Production hardening

The dev server skips a few headers that should be set at deploy time:

- **CSP** — add via your server (Vite dev needs `'unsafe-eval'` for HMR, so it's
  set in your hosting config, not `index.html`).
- **`X-Frame-Options: DENY`** (or CSP `frame-ancestors 'none'`) — prevents
  clickjacking. dApps are a common target.

`@ston-fi/omniston-sdk` is a direct dep because it's the optional peer of
`@ton/appkit/swap/omniston`. Don't remove it unless you drop Omniston.

## Project layout

```
src/
  main.tsx                    # entry, mounts <Providers><App/></Providers>
  Providers.tsx               # QueryClientProvider + AppKitProvider + styles.css
  appKit.ts                   # AppKit config: networks, connectors, providers
  App.tsx                     # the showcase
  SwapBody.tsx                # SwapWidget render-prop body, intercepts submit errors
                              # TODO(kit): drop when SwapWidget surfaces them via ctx
  SwapInsufficientNotice.tsx  # pre-build TON-for-gas check
                              # TODO(kit): drop when SwapWidget runs the check itself
  polyfills.ts                # Buffer polyfill for @ton/core
```

## Shipping as a standalone npm starter

This template lives inside the `@ton/kit` monorepo and uses two kinds of
workspace-only references in `package.json` that must be rewritten before the
project can install outside the repo:

- `workspace:*` — for `@ton/appkit` and `@ton/appkit-react`. Replace with a
  published version, e.g. `"^1.0.0-alpha.1"`.
- `catalog:` — for `react`, `react-dom`, `@types/react`, `@types/react-dom`,
  `@tanstack/react-query`, `buffer`, and `vite`. Resolve each one to the
  concrete version listed under `catalog:` in the repo's `pnpm-workspace.yaml`.

Then remove the `template` entry from `pnpm-workspace.yaml`, drop the
monorepo-only blocks from `vite.config.ts` (alias + `server.fs` + the
`kit-dev-barrel-fix` plugin), and the project is self-contained.
