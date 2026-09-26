import type { Metadata } from "next";
import { AiLabView } from "@/components/ai/AiLabView";

export const metadata: Metadata = {
  title: "AI Coding Lab",
};

export default function AiLabPage() {
  return (
    <div className="h-full min-h-0">
      <AiLabView />
    </div>
  );
}
