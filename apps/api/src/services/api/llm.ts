/** biome-ignore-all lint/suspicious/useAwait: This file uses a mix of sync and async function */

import OpenAI from "openai";
import llmSources, { circuitBreaker } from "@/config/llm-sources";
import { logger } from "@/config/logger";
import type {
  ChatRequestOptions,
  ChatResponse,
  CompletionRequestOptions,
  CompletionResponse,
} from "@/types/llm";

class LLMService {
  private readonly client: OpenAI;
  private readonly defaultModel: string;
  private readonly availableModels: string[];
  private readonly serviceN: string;

  constructor(
    apiKey: string,
    baseURL: string,
    defaultModel: string,
    availableModels: string[],
    serviceN: string
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
    this.defaultModel = defaultModel;
    this.availableModels = availableModels;
    this.serviceN = serviceN;
  }

  get model(): string {
    return this.defaultModel;
  }

  get models(): string[] {
    return [...this.availableModels];
  }

  isModelAvailable(model: string): boolean {
    return this.availableModels.includes(model);
  }

  getRandomModel(): string {
    const randomIndex = Math.floor(Math.random() * this.availableModels.length);
    return this.availableModels[randomIndex];
  }

  getModelByPreference(preferences: string[]): string {
    for (const pref of preferences) {
      if (this.isModelAvailable(pref)) {
        return pref;
      }
    }
    return this.defaultModel;
  }

  /**
   * Executes a function with model fallback logic. If a specific model is requested and fails, it will try other available models before giving up.
   * @param executeFn Function that executes the call with a specific model
   * @param requestedModel Specific model requested (optional)
   * @returns Result of the successful execution
   */
  private async *tryModelsWithFallback(
    executeFn: (model: string) => AsyncGenerator<string, void, unknown>,
    requestedModel?: string
  ): AsyncGenerator<string, void, unknown> {
    if (requestedModel) {
      if (!this.isModelAvailable(requestedModel)) {
        yield `[Error from ${this.serviceN}]: Model "${requestedModel}" is not available. Available models: ${this.availableModels.join(", ")}`;
        return;
      }

      try {
        yield* executeFn(requestedModel);
        circuitBreaker.recordSuccess(this.serviceN);
        return;
      } catch (error) {
        circuitBreaker.recordFailure(this.serviceN);
        yield `[Error from ${this.serviceN}]: ${(error as Error).message}`;
        return;
      }
    }

    for (const currentModel of this.availableModels) {
      try {
        yield* executeFn(currentModel);
        circuitBreaker.recordSuccess(this.serviceN);
        return;
      } catch (error) {
        console.warn(
          `Model ${currentModel} failed, trying next model: ${(error as Error).message}`
        );
      }
    }

    circuitBreaker.recordFailure(this.serviceN);
    yield `[Error from ${this.serviceN}]: All models failed`;
  }
  /**
   * Handles streaming response from LLM, filtering out thinking tags and empty content.
   */
  private async *handleStreaming(
    completion: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): AsyncGenerator<string, void, unknown> {
    let thinking = false;
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content?.includes("<think>")) {
        thinking = true;
        logger.info(`LLM ${this.serviceN} is thinking...`);
        continue;
      }

      if (content?.includes("</think>")) {
        thinking = false;
        logger.info(`LLM ${this.serviceN} finished thinking.`);
        continue;
      }

      if (content?.trim() === "") {
        continue;
      }

      if (content && !thinking) {
        yield content;
      }
    }
  }

  /**
   * Handles streaming response for completion.
   */
  private async *handleStreamingCompletion(
    completion: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): AsyncGenerator<string, void, unknown> {
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Handles non-streaming response for completion.
   */
  private handleNonStreamingCompletion(
    completion: OpenAI.Chat.Completions.ChatCompletion
  ): string {
    return completion.choices[0]?.message?.content || "";
  }

  /**
   * Executes completion with the specified model.
   */
  private async *executeCompletion(
    selectedModel: string,
    prompt: string,
    temperature: number,
    stream: boolean
  ): AsyncGenerator<string, void, unknown> {
    const completion = await this.client.chat.completions.create({
      model: selectedModel,
      messages: [{ role: "user", content: prompt }],
      temperature,
      stream,
    });

    if (stream) {
      yield* this.handleStreamingCompletion(
        completion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
      );
    } else {
      const result = this.handleNonStreamingCompletion(
        completion as OpenAI.Chat.Completions.ChatCompletion
      );
      yield result;
    }
  }

  /**
   * Executes chat completion with the specified model.
   */
  private async *executeChat(
    selectedModel: string,
    messages: Array<{ role?: string; content: string }>,
    temperature: number,
    stream: boolean
  ): AsyncGenerator<string, void, unknown> {
    const completion = await this.client.chat.completions.create({
      model: selectedModel,
      messages: messages.map((msg) => ({
        role: msg.role || "user",
        content: msg.content,
      })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature,
      stream,
    });

    if (stream) {
      yield* this.handleStreaming(
        completion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
      );
    } else {
      const result = this.handleNonStreamingCompletion(
        completion as OpenAI.Chat.Completions.ChatCompletion
      );
      yield result;
    }
  }

  async *chat(options: ChatRequestOptions): ChatResponse {
    const { messages, model, stream = true, temperature = 0.2 } = options;

    const executeFn = (selectedModel: string) =>
      this.executeChat(selectedModel, messages, temperature, stream);

    yield* this.tryModelsWithFallback(executeFn, model);
  }

  async *completion(options: CompletionRequestOptions): CompletionResponse {
    const { prompt, model, stream = true, temperature = 0.7 } = options;

    const executeFn = (selectedModel: string) =>
      this.executeCompletion(selectedModel, prompt, temperature, stream);

    yield* this.tryModelsWithFallback(executeFn, model);
  }
}

export function getAvailableProviders() {
  return llmSources
    .filter((source) => source.apiKey && circuitBreaker.canAttempt(source.name))
    .map((source) => ({
      name: source.name,
      serviceName: source.serviceN,
      defaultModel: source.defaultModel,
      availableModels: source.models,
      priority: source.priority,
    }))
    .sort((a, b) => a.priority - b.priority);
}

let currentServiceIndex = 0;

export function createLLMService(): { service: LLMService; name: string } {
  const availableSources = llmSources
    .filter((source) => source.apiKey && circuitBreaker.canAttempt(source.name))
    .sort((a, b) => a.priority - b.priority);

  if (availableSources.length === 0) {
    throw new Error(
      "No LLM services available - all services are down or misconfigured"
    );
  }

  const sourceIndex = currentServiceIndex % availableSources.length;
  currentServiceIndex++;

  for (let i = 0; i < availableSources.length; i++) {
    const source =
      availableSources[(sourceIndex + i) % availableSources.length];
    try {
      const service = new LLMService(
        source.apiKey || "",
        source.baseURL,
        source.defaultModel,
        source.models,
        source.serviceN
      );
      return { service, name: source.serviceN };
    } catch (error) {
      circuitBreaker.recordFailure(source.name);
      console.warn(
        `LLM service ${source.name} failed to initialize, trying next source: ${(error as Error).message}`
      );
    }
  }

  throw new Error(
    "No LLM services available - all initialization attempts failed"
  );
}
