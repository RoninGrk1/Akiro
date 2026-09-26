import type { Metadata } from "next";
import { WorkspaceView } from "@/components/workspace/WorkspaceView";

export const metadata: Metadata = {
  title: "Development Workspace",
};

export default function WorkspacePage() {
  return (
    <div className="h-full min-h-0">
      <WorkspaceView />
    </div>
  );
}
