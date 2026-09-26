# Akiro

One website. Twenty tools. One expert AI.

Akiro is a Web3 development environment — code, contracts, terminal, and deploy tools in one place.

## Quick start

```bash
git clone https://github.com/RoninGrk1/Akiro.git
cd Akiro
cp .env.example .env.local
# add random secrets (required for the env vault / sessions):
echo "ENV_VAULT_SECRET=$(openssl rand -hex 32)" >> .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -hex 32)" >> .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm test
npm run lint
npm run build
```

Do not commit `.env.local`.

## What works out of the box

These run locally with no cloud API keys:

- File workspace (edit and save real project files)
- Terminal (safe allowlisted commands)
- Solidity compiler (real solc)
- SQLite database console
- HTTP API tester
- RPC health checks
- Browser wallet connect (MetaMask and similar)

## What needs a key

These stay off until you add credentials in `.env.local` (see `.env.example`):

- AI Coding Lab → `AI_API_KEY`
- WalletConnect → `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- GitHub sign-in → `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- IPFS → `IPFS_JWT` or `WEB3_STORAGE_TOKEN`
- Vercel deploy → `VERCEL_TOKEN`

Until then, Akiro shows **Needs configuration** — it will not pretend they succeeded.

## Pages

| Page | Path |
| --- | --- |
| Dashboard | `/dashboard` |
| Workspace | `/workspace` |
| AI Coding Lab | `/ai-lab` |
| Web3 Hub | `/web3` |
| Tools | `/tools` |
| Integrations | `/integrations` |
| Settings | `/settings` |

## Stack

Next.js · React · TypeScript · Tailwind · Monaco · solc · wagmi / viem · SQLite

## Security

- Never asks for seed phrases or private keys
- Secrets stay on the server (`.env.local`)
- Destructive actions ask for confirmation

More detail: [SECURITY.md](./SECURITY.md)
