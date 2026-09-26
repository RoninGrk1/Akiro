export type AiAction =
  | "chat"
  | "generate"
  | "explain"
  | "refactor"
  | "review"
  | "debug"
  | "interpret-terminal";

export type ClaimKind = "Verified" | "Suggestion";

export type AiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  action?: AiAction;
  claims?: { kind: ClaimKind; text: string }[];
  proposedPatch?: {
    path: string;
    description: string;
    newContent: string;
  };
  error?: boolean;
};

let seq = 0;
export function nextMessageId(): string {
  seq += 1;
  return `msg-${Date.now()}-${seq}`;
}
