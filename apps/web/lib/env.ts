import { z } from "zod";

const webEnvSchema = z.object({
  NEXT_PUBLIC_NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Hikki"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_FRONT_END_URL: z.string().url().default("http://localhost:3001"),
});

const parsed = webEnvSchema.parse(process.env);

export const env = {
  NODE_ENV: parsed.NEXT_PUBLIC_NODE_ENV,
  APP_NAME: parsed.NEXT_PUBLIC_APP_NAME,
  API_URL: parsed.NEXT_PUBLIC_API_URL,
  FRONT_END_URL: parsed.NEXT_PUBLIC_FRONT_END_URL,
};

export type WebEnv = typeof env;
