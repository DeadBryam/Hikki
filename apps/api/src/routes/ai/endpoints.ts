/**
 * AI Documentation Routes - Wiki Style
 *
 * Provides wiki-style documentation endpoints for AI agents:
 * - /docs/ai           -> Markdown index with category summaries
 * - /docs/ai?category= -> Markdown for specific category
 */

import { Elysia, t } from "elysia";
import {
  getCategoryIds,
  getCategoryMarkdown,
  getIndexMarkdown,
  getMarkdownDoc,
} from "../../services/ai-endpoint-registry";

const getIndexHandler = ({ query }: { query: { category?: string } }) => {
  if (query.category) {
    if (query.category === "all") {
      return getMarkdownDoc();
    }
    const md = getCategoryMarkdown(query.category);
    if (!md) {
      return `Category '${query.category}' not found.\n\nAvailable categories: ${getCategoryIds().join(", ")}\n`;
    }
    return md;
  }
  return getIndexMarkdown();
};

export const aiDocsRoutes = new Elysia({ prefix: "" }).get(
  "/",
  getIndexHandler,
  {
    detail: {
      summary: "API Documentation",
      description:
        "Get API documentation in Markdown format. Use ?category= to get specific category documentation.",
      tags: ["AI Documentation"],
    },
    query: t.Object({
      category: t.Optional(t.String()),
    }),
  }
);
