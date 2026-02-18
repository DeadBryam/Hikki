import { z } from "zod";

const nonEmptyString = (val: unknown) =>
  typeof val === "string" && val !== "" ? val : undefined;

const webEnvSchema = z.object({
  NEXT_PUBLIC_NODE_ENV: z.preprocess(
    nonEmptyString,
    z.enum(["development", "test", "production"]).default("development")
  ),
  NEXT_PUBLIC_APP_NAME: z.preprocess(
    nonEmptyString,
    z.string().default("Hikki")
  ),
  NEXT_PUBLIC_API_URL: z.preprocess(
    nonEmptyString,
    z.string().url().default("http://localhost:3000")
  ),
});

const parsed = webEnvSchema.parse({
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

export const env = {
  NODE_ENV: parsed.NEXT_PUBLIC_NODE_ENV,
  APP_NAME: parsed.NEXT_PUBLIC_APP_NAME,
  API_URL: parsed.NEXT_PUBLIC_API_URL,
};

export type WebEnv = typeof env;
