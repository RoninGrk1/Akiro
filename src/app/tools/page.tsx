import type { Metadata } from "next";
import { ToolsCatalogView } from "@/components/tools/ToolsCatalogView";

export const metadata: Metadata = {
  title: "Developer Tools",
};

export default function ToolsPage() {
  return <ToolsCatalogView />;
}
