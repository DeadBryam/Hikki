import type { IMemoryService } from "../services/llm-tools";

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

/** Common options for LLM requests (temperature, streaming, model selection) */
export interface LLMRequestOptions {
  model?: string;
  stream?: boolean;
  temperature?: number;
}

export interface ChatRequest extends LLMRequestOptions {
  question: string;
  thread?: string;
}

export interface ChatRequestOptions extends LLMRequestOptions {
  memoryService?: IMemoryService;
  messages: Message[];
}

export interface CompletionRequestOptions extends LLMRequestOptions {
  prompt: string;
}

export type ChatResponse = AsyncGenerator<string>;
export type CompletionResponse = AsyncGenerator<string>;
