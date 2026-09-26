import type { Metadata } from "next";
import { Web3HubView } from "@/components/web3/Web3HubView";

export const metadata: Metadata = {
  title: "Web3 Hub",
};

export default function Web3Page() {
  return <Web3HubView />;
}
