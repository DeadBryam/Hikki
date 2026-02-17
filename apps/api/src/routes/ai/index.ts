/**
 * AI Documentation Routes Module
 *
 * Aggregates all AI documentation routes under /api/v1/docs/ai
 */

import { Elysia } from "elysia";
import { aiDocsRoutes } from "./endpoints";

export const aiDocsIndex = new Elysia({ prefix: "/docs/ai" }).use(aiDocsRoutes);

export default aiDocsIndex;
