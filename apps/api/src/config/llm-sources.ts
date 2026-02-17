import { loadLLMConfigSync } from "./config-loader";
import { env } from "./env";

interface LLMSource {
  apiKey?: string;
  baseURL: string;
  defaultModel: string;
  models: string[];
  name: string;
  priority: number;
  serviceN: string;
}

interface CircuitBreakerState {
  failures: number;
  isOpen: boolean;
  lastFailureTime: number;
}

class LLMCircuitBreaker {
  private readonly states = new Map<string, CircuitBreakerState>();
  private readonly threshold: number;
  private readonly timeout: number;

  constructor(
    threshold: number = env.LLM_CIRCUIT_BREAKER_THRESHOLD,
    timeout: number = env.LLM_CIRCUIT_BREAKER_TIMEOUT
  ) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  canAttempt(serviceName: string): boolean {
    const state = this.states.get(serviceName);
    if (!state) {
      return true;
    }

    if (state.isOpen) {
      const timeSinceLastFailure = Date.now() - state.lastFailureTime;
      if (timeSinceLastFailure > this.timeout) {
        state.isOpen = false;
        state.failures = 0;
        return true;
      }
      return false;
    }

    return true;
  }

  recordSuccess(serviceName: string): void {
    const state = this.states.get(serviceName);
    if (state) {
      state.failures = 0;
      state.isOpen = false;
    }
  }

  recordFailure(serviceName: string): void {
    const state = this.states.get(serviceName) || {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    };

    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.failures >= this.threshold) {
      state.isOpen = true;
    }

    this.states.set(serviceName, state);
  }

  getState(serviceName: string): CircuitBreakerState | undefined {
    return this.states.get(serviceName);
  }
}

const circuitBreaker = new LLMCircuitBreaker();

function buildLLMSources(): LLMSource[] {
  const config = loadLLMConfigSync(env.AI_CONFIG_PATH);

  const sources: LLMSource[] = [];

  for (const [providerName, providerConfig] of Object.entries(config)) {
    const priorityFromEnv = env.LLM_PRIMARY_SERVICE === providerName ? 0 : 999;
    const priorityFromConfig = providerConfig.priority ?? 999;
    const finalPriority = Math.min(priorityFromEnv, priorityFromConfig);

    sources.push({
      name: providerName,
      apiKey: providerConfig.api_key,
      baseURL: providerConfig.base_url,
      defaultModel: providerConfig.models[0] || "",
      models: providerConfig.models,
      serviceN: capitalize(providerName),
      priority: finalPriority,
    });
  }

  sources.sort((a, b) => a.priority - b.priority);

  return sources;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const llmSources: LLMSource[] = buildLLMSources();

export { circuitBreaker, type LLMSource };
export default llmSources;
