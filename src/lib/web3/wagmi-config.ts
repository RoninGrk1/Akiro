"use client";

import { http, createConfig } from "wagmi";
import { mainnet, sepolia, foundry } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();

export const walletConnectConfigured = Boolean(wcId);

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet, foundry],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [foundry.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
