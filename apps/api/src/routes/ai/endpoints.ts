/**
 * AI Documentation Routes - Wiki Style
 *
 * Provides documentation endpoints for AI agents:
 * - /docs/ai               -> TOON index (default)
 * - /docs/ai?format=toon -> TOON format
 * - /docs/ai?format=json  -> JSON format
 * - /docs/ai?format=markdown -> Markdown format
 * - /docs/ai?category=   -> Specific category documentation
 */

import { Elysia, t } from "elysia";
import {
  getAllEndpointsDoc,
  getCategoryDoc,
  getCategoryIds,
  getCategoryMarkdown,
  getCategoryTOON,
  getIndexMarkdown,
  getIndexTOON,
  getMarkdownDoc,
  getTOONDoc,
  getWikiIndex,
} from "../../services/ai-endpoint-registry";

type Format = "toon" | "json" | "markdown";

const getJsonResponse = (category?: string) => {
  if (category === "all") {
    return getAllEndpointsDoc();
  }
  if (category) {
    const cat = getCategoryDoc(category);
    if (!cat) {
      return {
        error: `Category '${category}' not found. Available: ${getCategoryIds().join(", ")}`,
      };
    }
    return cat;
  }
  return { index: getWikiIndex() };
};

const getMarkdownResponse = (category?: string) => {
  if (category === "all") {
    return getMarkdownDoc();
  }
  if (category) {
    const md = getCategoryMarkdown(category);
    if (!md) {
      return `Category '${category}' not found.\n\nAvailable categories: ${getCategoryIds().join(", ")}\n`;
    }
    return md;
  }
  return getIndexMarkdown();
};

const getToonResponse = (category?: string) => {
  if (category === "all") {
    return getTOONDoc();
  }
  if (category) {
    const toon = getCategoryTOON(category);
    if (!toon) {
      return `Category '${category}' not found.\n\nAvailable categories: ${getCategoryIds().join(", ")}\n`;
    }
    return toon;
  }
  return getIndexTOON();
};

const getIndexHandler = ({
  query,
}: {
  query: { category?: string; format?: Format };
}) => {
  const format = query.format ?? "toon";

  switch (format) {
    case "json":
      return getJsonResponse(query.category);
    case "markdown":
      return getMarkdownResponse(query.category);
    case "toon":
      return getToonResponse(query.category);
    default:
      return `Invalid format '${format}'. Use: toon, json, or markdown.`;
  }
};

export const aiDocsRoutes = new Elysia({ prefix: "" }).get(
  "/",
  getIndexHandler,
  {
    detail: {
      summary: "API Documentation",
      description:
        "Get API documentation. Default format: TOON. Use ?format= to choose: toon, json, or markdown. Use ?category= to get specific category.",
      tags: ["AI Documentation"],
    },
    query: t.Object({
      category: t.Optional(t.String()),
      format: t.Optional(
        t.Union([t.Literal("toon"), t.Literal("json"), t.Literal("markdown")])
      ),
    }),
  }
);
