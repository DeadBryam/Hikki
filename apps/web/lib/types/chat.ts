export interface Message {
  content: string;
  id: string;
  isError?: boolean;
  isStreaming?: boolean;
  model?: string;
  role: "user" | "assistant";
  timestamp: Date;
}
