# Akiro

**One website. Twenty tools. One expert AI. Zero unnecessary complexity.**

Akiro is a lightweight Web3 development environment — design-system-first, developer-focused, and built so the coding → contract → deploy loop lives in one place.

> Official product name: **Akiro** (British English UI).

## Local-first production mode

This build prefers **real local behaviour** over demos:

| Feature | Status without cloud secrets |
| --- | --- |
| On-disk workspace (`/workspace/akiro-projects/default`) | **Available** |
| File list/read/write APIs | **Available** |
| Sandboxed terminal (allowlisted) | **Available** |
| solc compile → real ABI/bytecode | **Available** |
| SQLite console (`akiro.db`) | **Available** |
| HTTP API client (SSRF-safe) | **Available** |
| RPC health (`eth_chainId` / `eth_blockNumber`) | **Available** |
| Injected browser wallet (wagmi/viem) | **Available** (needs extension) |
| Env vault (AES-GCM) | **Available** when `ENV_VAULT_SECRET` in `.env.local` |
| WalletConnect / GitHub OAuth / IPFS / Vercel / AI | **Needs configuration** — no fake success |

## Stack

- **Next.js** (App Router) · **React** · **TypeScript**
- **Tailwind CSS** brand tokens · **Monaco**
- **solc** (server) · **viem** / **wagmi** · **sql.js**
- Vitest · British English (`en-GB`)

### Brand

| Token | Value |
| --- | --- |
| Background | `#080B0D` |
| Accent green | `#22E676` |
| Accent blue | `#3478F6` |
| Gold | `#D9A441` |

## How to run

```bash
cd /workspace/akiro   # or your clone path
npm install
# First setup: ensure .env.local exists (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
npm run lint
npm test
```

### Local secrets (`.env.local`)

Copy `.env.example` → `.env.local`. On first setup this repo may already contain a generated:

- `ENV_VAULT_SECRET` — AES-GCM key for the env vault
- `NEXTAUTH_SECRET` — session secret placeholder

Generate yourself if missing:

```bash
echo "ENV_VAULT_SECRET=$(openssl rand -hex 32)" >> .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -hex 32)" >> .env.local
```

**Never commit `.env.local`.** Optional cloud vars are documented in `.env.example`.

## Architecture

```
/workspace/akiro-projects/default   On-disk Foundry+Next starter (source of truth)
src/app/api/*                       Real route handlers (files, terminal, solc, …)
src/lib/server/*                    Path safety, exec allowlist, vault, sqlite, SSRF
src/components/*                    UI wired to APIs — no SAMPLE_FILES / mock shell
```

## Routes

| Path | Section |
| --- | --- |
| `/` → `/dashboard` | Dashboard |
| `/workspace` | Development Workspace |
| `/ai-lab` | AI Coding Lab |
| `/web3` | Web3 Hub |
| `/tools` | Developer Tools |
| `/integrations` | Integrations |
| `/settings` | Settings |
| `/sign-in` | Auth (guest labelled; GitHub when configured) |

## Security highlights

- No seed phrases / private keys — ever
- Server secrets via `process.env` only
- Sensitive actions need confirm UI
- **Verified** vs **Suggestion** labelling

See [SECURITY.md](./SECURITY.md).

## Licence

Private / unpublished — all rights reserved unless otherwise stated.
