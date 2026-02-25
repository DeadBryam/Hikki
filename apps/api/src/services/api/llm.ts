/** biome-ignore-all lint/suspicious/useAwait: This file uses a mix of sync and async function */

import OpenAI from "openai";
import {
  memoryRepository,
  reminderRepository,
  userRepository,
} from "@/config/dependencies";
import llmSources, { circuitBreaker } from "@/config/llm-sources";
import { logger } from "@/config/logger";
import {
  allTools,
  createMemoryService,
  createReminderService,
  executeTool,
  type IMemoryService,
  type IReminderService,
} from "@/services/llm-tools";
import { ReminderService } from "@/services/reminder-service";
import type {
  ChatRequestOptions,
  ChatResponse,
  ChatWithToolsRequest,
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
  private async *handleStreamingCompletion(
    completion: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): AsyncGenerator<string, void, unknown> {
    let thinking = false;
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (content.includes("<think>")) {
        thinking = true;
        logger.info(`LLM ${this.serviceN} is thinking...`);
        continue;
      }

      if (content.includes("</think>")) {
        thinking = false;
        logger.info(`LLM ${this.serviceN} finished thinking.`);
        continue;
      }

      if (content.trim() === "") {
        continue;
      }

      if (content && !thinking) {
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
    const completion = await this.executeLLMRequest({
      selectedModel,
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

  private async executeLLMRequest(props: {
    selectedModel: string;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    temperature: number;
    stream: boolean;
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  }) {
    const completion = await this.client.chat.completions.create({
      model: props.selectedModel,
      messages:
        props.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: props.temperature,
      stream: props.stream,
      tools: props.tools,
    });

    if (props.stream) {
      return completion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
    }
    return completion as OpenAI.Chat.Completions.ChatCompletion;
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
    const completion = await this.executeLLMRequest({
      selectedModel,
      messages:
        messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
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
   * Executes all tool calls and collects results
   */
  private async executeToolCalls(
    toolCalls: Array<{
      type: string;
      function?: { name: string; arguments: string };
      id: string;
    }>,
    memoryService: IMemoryService,
    reminderService?: IReminderService
  ): Promise<
    Array<{
      role: "tool";
      content: string;
      tool_call_id: string;
    }>
  > {
    const toolResults: Array<{
      role: "tool";
      content: string;
      tool_call_id: string;
    }> = [];

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function" || !toolCall.function) {
        continue;
      }

      const toolName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      logger.info(
        `Executing tool: ${toolName} with args: ${JSON.stringify(args)}`
      );

      const result = executeTool(
        toolName,
        args,
        memoryService,
        reminderService
      );
      toolResults.push({
        role: "tool",
        content: result,
        tool_call_id: toolCall.id,
      });
    }

    return toolResults;
  }

  /**
   * Sends tool results back to LLM and streams final response
   */
  private async *streamFinalCompletion(
    selectedModel: string,
    originalMessages: Array<{ role?: string; content: string }>,
    initialMessage: OpenAI.Chat.Completions.ChatCompletionMessage,
    toolResults: Array<{
      role: "tool";
      content: string;
      tool_call_id: string;
    }>,
    temperature: number,
    stream: boolean
  ): AsyncGenerator<string, void, unknown> {
    const messagesWithResults = [
      ...originalMessages.map((m) => ({
        role: m.role || "user",
        content: m.content,
      })),
      initialMessage,
      ...toolResults,
    ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    const finalCompletion = await this.executeLLMRequest({
      selectedModel,
      messages: messagesWithResults,
      temperature,
      stream,
    });

    if (stream) {
      yield* this.handleStreamingCompletion(
        finalCompletion as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
      );
    } else {
      const result = this.handleNonStreamingCompletion(
        finalCompletion as OpenAI.Chat.Completions.ChatCompletion
      );
      yield result;
    }
  }

  /**
   * Handles initial LLM response without tool calls
   */
  private async *streamInitialCompletion(
    initialCompletion: OpenAI.Chat.Completions.ChatCompletion,
    stream: boolean
  ): AsyncGenerator<string, void, unknown> {
    logger.info(
      `LLM ${this.serviceN} response does not require tool calls, returning directly.`
    );

    const result = this.handleNonStreamingCompletion(initialCompletion);

    if (stream) {
      const chunkSize = 10;
      for (let i = 0; i < result.length; i += chunkSize) {
        yield result.slice(i, i + chunkSize);
      }
    } else {
      yield result;
    }
  }

  /**
   * Executes chat with tools and handles tool calls recursively.
   * This implements the tool calling flow:
   * 1. User message -> LLM (with tools)
   * 2. LLM returns tool_calls OR text response
   * 3. If tool_calls: execute tools -> call LLM again with results -> return final response
   * 4. If text: return directly
   */
  async *chatWithTools(options: ChatWithToolsRequest): ChatResponse {
    const {
      messages,
      model,
      stream = true,
      temperature = 0.2,
      memoryService,
      reminderService,
    } = options;

    const selectedModel = model || this.defaultModel;

    if (!this.isModelAvailable(selectedModel)) {
      yield `[Error from ${this.serviceN}]: Model "${selectedModel}" is not available.`;
      return;
    }

    try {
      const initialCompletion = (await this.executeLLMRequest({
        selectedModel,
        messages:
          messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature,
        stream: false,
        tools: allTools,
      })) as OpenAI.Chat.Completions.ChatCompletion;

      const initialMessage = initialCompletion?.choices?.[0]?.message;
      const toolCalls = initialMessage?.tool_calls;

      if (toolCalls && toolCalls?.length > 0) {
        logger.info(
          `LLM ${this.serviceN} triggered ${toolCalls.length} tool call(s)`
        );

        const toolResults = await this.executeToolCalls(
          toolCalls,
          memoryService,
          reminderService
        );

        yield* this.streamFinalCompletion(
          selectedModel,
          messages,
          initialMessage,
          toolResults,
          temperature,
          stream
        );
      } else {
        yield* this.streamInitialCompletion(initialCompletion, stream);
      }

      circuitBreaker.recordSuccess(this.serviceN);
    } catch (error) {
      logger.error(
        `Error in chatWithTools for service ${this.serviceN}: ${(error as Error).message}`
      );
      circuitBreaker.recordFailure(this.serviceN);
      yield `[Error from ${this.serviceN}]: ${(error as Error).message}`;
    }
  }

  /**
   * Chat method - supports both regular chat and chat with tools
   */
  async *chat(options: ChatRequestOptions): ChatResponse {
    const memoryServiceInstance = createMemoryService(
      memoryRepository,
      options.userId
    );

    const reminderServiceInstance = new ReminderService({
      reminderRepository,
      userRepository,
    });

    const reminderServiceForTools = createReminderService(
      reminderServiceInstance,
      options.userId
    );

    if (memoryServiceInstance) {
      yield* this.chatWithTools({
        ...options,
        memoryService: memoryServiceInstance,
        reminderService: reminderServiceForTools,
      });
      return;
    }

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
      logger.warn(
        `LLM service ${source.name} failed to initialize, trying next source: ${(error as Error).message}`
      );
    }
  }

  throw new Error(
    "No LLM services available - all initialization attempts failed"
  );
}
