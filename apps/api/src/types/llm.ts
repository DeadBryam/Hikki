export interface Message {
  content: string;
  role?: "system" | "user" | "assistant";
}

export interface LLMConfig {
  apiKey?: string;
  baseURL: string;
  defaultModel?: string;
  service?: string;
}

export interface ChatRequest {
  model?: string;
  question: string;
  stream?: boolean;
  thread?: string;
}

export interface ChatRequestOptions {
  messages: Message[];
  model?: string;
  stream?: boolean;
  temperature?: number;
}

export interface CompletionRequestOptions {
  model?: string;
  prompt: string;
  stream?: boolean;
  temperature?: number;
}

export type ChatResponse = AsyncGenerator<string>;
export type CompletionResponse = AsyncGenerator<string>;
