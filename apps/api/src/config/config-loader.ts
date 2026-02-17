import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { logger } from "./logger";

const llmProviderSchema = z.object({
  api_key: z.string(),
  base_url: z.string().url(),
  models: z.array(z.string()),
  priority: z.number().default(999),
});

const llmConfigSchema = z.record(z.string(), llmProviderSchema);

export interface LLMProvider {
  api_key: string;
  base_url: string;
  models: string[];
  priority?: number;
}

export interface LLMConfig {
  [provider: string]: LLMProvider;
}

export function loadLLMConfigSync(configPath?: string): LLMConfig {
  if (!configPath) {
    return {};
  }

  try {
    const resolvedPath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath);

    const fileContent = fs.readFileSync(resolvedPath, "utf-8");
    const parsed = JSON.parse(fileContent);

    const config = llmConfigSchema.parse(parsed);
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error(`Invalid JSON in config file: ${error.message}`);
    } else if (error instanceof z.ZodError) {
      logger.error(`Invalid LLM configuration schema: ${error.message}`);
    } else {
      logger.error(
        `Failed to load LLM configuration: ${(error as Error).message}`
      );
    }
    return {};
  }
}

export async function loadLLMConfig(configPath?: string): Promise<LLMConfig> {
  if (!configPath) {
    logger.warn("AI_CONFIG_PATH not provided. Using empty configuration.");
    return {};
  }

  try {
    const resolvedPath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath);

    const fileContent = await fsPromises.readFile(resolvedPath, "utf-8");
    const parsed = JSON.parse(fileContent);

    const config = llmConfigSchema.parse(parsed);
    logger.info(`LLM configuration loaded from ${resolvedPath}`);
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error(`Invalid JSON in config file: ${error.message}`);
    } else if (error instanceof z.ZodError) {
      logger.error(`Invalid LLM configuration schema: ${error.message}`);
    } else {
      logger.error(
        `Failed to load LLM configuration: ${(error as Error).message}`
      );
    }
    return {};
  }
}
