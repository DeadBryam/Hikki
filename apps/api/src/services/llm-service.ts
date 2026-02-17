import { logger } from "@/config/logger";
import { createLLMService } from "./api/llm";

export default class LLMService {
  async generateTitleWithAI(
    firstMessage: string
  ): Promise<{ title: string; serviceUsed: string }> {
    const { service, name } = createLLMService();
    const prompt = `Generate a short, descriptive title for this conversation based on the first message: "${firstMessage}". Keep it under 25 characters.`;

    let result = "";
    for await (const chunk of service.completion({ prompt, stream: false })) {
      result += chunk;
    }

    const title = result.trim() || `Chat ${Date.now()}`;
    logger.info(`Generated title: "${title}" using ${name}`);
    return { title, serviceUsed: name };
  }
}
