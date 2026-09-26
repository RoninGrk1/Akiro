# Security policy — Akiro

## What this build is

Akiro is a **local-first production-capable** Web3 development environment. Local features (workspace filesystem, sandboxed terminal, solc, SQLite, HTTP proxy, RPC health, injected wallets, env vault) are real. Cloud features without secrets return **Needs configuration** / HTTP 503 — never fake success.

## What we never do

- **Never** ask for seed phrases, mnemonic words, or private keys.
- **Never** embed OAuth client secrets, RPC API keys, or wallet keys in client bundles (`NEXT_PUBLIC_*` only for non-secret config).
- **Never** invent wallet addresses, CIDs, compile bytecode, AI answers, or deploy URLs.
- **Never** log env-vault plaintext values to the console.
- **Never** run arbitrary shell — terminal commands are allowlisted and cwd-locked to the project root.

## Client storage

| Key | Contents | Risk notes |
| --- | --- | --- |
| `akiro.rpc.*` | Public/local RPC URLs | Do not paste API keys into URLs |
| `akiro.explorer.v1` | Explorer base URL | Public only |
| `akiro.session.guest.v1` | Guest display name | Labelled guest mode |
| `akiro.integrations.ipfs.v1` | History of **real** CIDs after pin | Local only |

Encrypted env entries live in `akiro-projects/default/akiro-env-vault.json` (AES-GCM with `ENV_VAULT_SECRET`).

## Sandbox notes

1. Terminal: allowlisted binaries only; reject `..`, shell metacharacters, destructive git; 60s timeout.
2. Workspace file API: path-traversal safe under project root.
3. HTTP proxy: DNS + private IP SSRF blocking.
4. Deploy / pin / AI patches: explicit confirm UI.
5. Contract deploy: `walletClient.deployContract` in the browser only when a wallet is connected.

## Auth & rate limiting

1. Keep `GITHUB_CLIENT_SECRET`, `AI_API_KEY`, `ENV_VAULT_SECRET`, `IPFS_JWT`, `VERCEL_TOKEN` on the **server** only.
2. Prefer httpOnly, Secure, SameSite cookies when Auth.js is fully wired.
3. Rate-limit auth callbacks, compile jobs, and deploy endpoints per user/IP in production deployments.

## Verified vs Suggestion

- **Verified** — tool/RPC/compiler/filesystem confirmed.
- **Suggestion** — model opinion or heuristic guidance without a tool result.

## Reporting

If you find a secret in the client bundle or a seed/private-key input, treat it as a critical defect and remove it immediately.
