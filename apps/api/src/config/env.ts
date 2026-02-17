import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3000),
  DATABASE_URL: z
    .string()
    .default(process.env.DATABASE_URL || "hikki-database.sqlite"),
  APP_NAME: z.string().default("Hikki"),
  API_URL: z.string().url().default("http://localhost:3000"),
  FRONT_END_URL: z.string().url().default("http://localhost:3001"),
  RESEND_API_KEY: z.string().optional().nullable(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  SESSION_CACHE_SIZE: z.string().regex(/^\d+$/).transform(Number).default(100),

  AI_CONFIG_PATH: z.string().optional(),
  LLM_PRIMARY_SERVICE: z.enum(["cerebras", "groq"]).default("cerebras"),
  LLM_CIRCUIT_BREAKER_THRESHOLD: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default(3),
  LLM_CIRCUIT_BREAKER_TIMEOUT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default(300_000),
});

export const env = envSchema.parse(process.env);
