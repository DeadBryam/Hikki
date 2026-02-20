/**
 * AI Endpoint Registry
 *
 * Imports endpoint data from JSON files for better maintainability.
 */

import categoriesData from "../data/ai-categories.json";
import aiDiscoveryData from "../data/endpoints/ai-discovery.json";
import authenticationData from "../data/endpoints/authentication.json";
import chatData from "../data/endpoints/chat.json";
import passwordResetData from "../data/endpoints/password-reset.json";
import threadsData from "../data/endpoints/threads.json";
import verificationData from "../data/endpoints/verification.json";
import type {
  AIAllEndpointsDoc,
  AICategoryDoc,
  AIEndpointDoc,
  AIWikiIndex,
} from "../types/ai-endpoints";

type CategoryData = Record<
  string,
  { id: string; name: string; description: string }
>;

const CATEGORIES: CategoryData = categoriesData;

const ENDPOINTS_BY_CATEGORY: Record<string, AIEndpointDoc[]> = {
  authentication: authenticationData as unknown as AIEndpointDoc[],
  verification: verificationData as unknown as AIEndpointDoc[],
  "password-reset": passwordResetData as unknown as AIEndpointDoc[],
  threads: threadsData as unknown as AIEndpointDoc[],
  chat: chatData as unknown as AIEndpointDoc[],
  "ai-discovery": aiDiscoveryData as unknown as AIEndpointDoc[],
};

/**
 * Get the wiki index with all categories
 */
export function getWikiIndex(): AIWikiIndex {
  const categories = Object.values(CATEGORIES).map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    endpoint_count: ENDPOINTS_BY_CATEGORY[cat.id]?.length || 0,
    url: `/docs/ai/${cat.id}`,
  }));

  const totalEndpoints = Object.values(ENDPOINTS_BY_CATEGORY).reduce(
    (sum, endpoints) => sum + endpoints.length,
    0
  );

  return {
    version: "1.0.0",
    description:
      "AI-friendly API documentation wiki. Start here to discover all API capabilities.",
    total_categories: categories.length,
    categories,
    metadata: {
      base_url: "http://localhost:3000",
      total_endpoints: totalEndpoints,
    },
    all_endpoints_url: "/docs/ai/all",
  };
}

/**
 * Get documentation for a specific category
 */
export function getCategoryDoc(categoryId: string): AICategoryDoc | null {
  const category = CATEGORIES[categoryId];
  const endpoints = ENDPOINTS_BY_CATEGORY[categoryId];

  if (!(category && endpoints)) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    total_endpoints: endpoints.length,
    endpoints,
  };
}

/**
 * Get all endpoints documentation
 */
export function getAllEndpointsDoc(): AIAllEndpointsDoc {
  const categories = Object.values(CATEGORIES).map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    total_endpoints: ENDPOINTS_BY_CATEGORY[cat.id]?.length || 0,
    endpoints: ENDPOINTS_BY_CATEGORY[cat.id] || [],
  }));

  const totalEndpoints = categories.reduce(
    (sum, cat) => sum + cat.total_endpoints,
    0
  );

  return {
    version: "1.0.0",
    total_endpoints: totalEndpoints,
    categories,
    metadata: {
      base_url: "http://localhost:3000",
      generated_at: new Date().toISOString(),
    },
  };
}

/**
 * List all available category IDs
 */
export function getCategoryIds(): string[] {
  return Object.keys(CATEGORIES);
}

// Markdown generation functions

function formatParamsMd(
  params: Record<
    string,
    {
      type: string;
      required: boolean;
      description: string;
      example?: unknown;
      constraints?: string;
    }
  >,
  title: string
): string {
  let md = `**${title}:**\n`;
  for (const [key, val] of Object.entries(params)) {
    md += `- \`${key}\` (${val.type}${val.required ? "" : "?"}): ${val.description}`;
    if (val.example) {
      md += ` \`Example: ${val.example}\``;
    }
    if (val.constraints) {
      md += ` (${val.constraints})`;
    }
    md += "\n";
  }
  return `${md}\n`;
}

function formatBodyMd(
  body: Record<string, { type: string; required: boolean; example?: unknown }>
): string {
  const bodyEx: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(body)) {
    bodyEx[key] =
      val.example ?? (val.required ? `<${val.type}>` : `<${val.type}?>`);
  }
  return `\`\`\`json\n${JSON.stringify(bodyEx, null, 2)}\n\`\`\`\n\n`;
}

function formatResponsesMd(
  responses: Record<string, { description: string }>
): string {
  let md = "#### Responses\n\n";
  for (const [code, resp] of Object.entries(responses)) {
    md += `**${code}:** ${resp.description}\n`;
  }
  return `${md}\n`;
}

function formatExamplesMd(
  examples: { summary: string; request?: unknown; response?: unknown }[]
): string {
  let md = "#### Examples\n\n";
  for (const ex of examples) {
    md += `**${ex.summary}:**\n`;
    if (ex.request) {
      md += `\`\`\`json\n${JSON.stringify(ex.request, null, 2)}\n\`\`\`\n\n`;
    }
    if (ex.response) {
      md +=
        "Response:\n```json\n" +
        JSON.stringify(ex.response, null, 2) +
        "\n```\n\n";
    }
  }
  return md;
}

function endpointToMarkdown(endpoint: AIEndpointDoc, index: number): string {
  const auth = endpoint.requires_auth ? "**Requires Auth**" : "**Public**";

  let md = `### ${index + 1}. ${endpoint.name}\n\n`;
  md += `**${endpoint.method} ${endpoint.path}** ${auth}\n\n`;
  md += `${endpoint.what_it_does}\n\n`;
  md += `**When to use:** ${endpoint.when_to_use}\n\n`;
  md += `**How to use:** ${endpoint.how_to_use}\n\n`;

  if (endpoint.request) {
    md += "#### Request\n\n";
    if (endpoint.request.params) {
      md += formatParamsMd(endpoint.request.params, "Path Parameters");
    }
    if (endpoint.request.query) {
      md += formatParamsMd(endpoint.request.query, "Query Parameters");
    }
    if (endpoint.request.body) {
      md += `**Body:**\n${formatBodyMd(endpoint.request.body)}`;
    }
  }

  if (endpoint.responses) {
    md += formatResponsesMd(endpoint.responses);
  }
  if (endpoint.examples) {
    md += formatExamplesMd(endpoint.examples);
  }
  if (endpoint.rate_limit) {
    md += `**Rate Limit:** ${endpoint.rate_limit.requests} requests per ${endpoint.rate_limit.window}\n`;
  }

  return md;
}

function categoryToMarkdownDoc(category: AICategoryDoc): string {
  let md = `# ${category.name}\n\n`;
  md += `${category.description}\n\n`;
  md += `Total endpoints: ${category.total_endpoints}\n\n`;
  md += "---\n\n";

  category.endpoints.forEach((ep, idx) => {
    md += endpointToMarkdown(ep, idx);
    md += "\n---\n\n";
  });

  return md;
}

function getAllMarkdown(): string {
  const index = getWikiIndex();
  let md = "# Hikki API Documentation\n\n";
  md += `Version: ${index.version}\n\n`;
  md += `${index.description}\n\n`;
  md += "---\n\n";
  md += "## Table of Contents\n\n";

  for (const cat of index.categories) {
    md += `- [${cat.name}](#${cat.id})\n`;
  }
  md += "\n---\n\n";

  const allDoc = getAllEndpointsDoc();
  for (const cat of allDoc.categories) {
    md += `<a id="${cat.id}"></a>\n\n`;
    md += categoryToMarkdownDoc(cat);
  }

  return md;
}

/**
 * Get all endpoints documentation as Markdown
 */
export function getMarkdownDoc(): string {
  return getAllMarkdown();
}

/**
 * Get a specific category as Markdown
 */
export function getCategoryMarkdown(categoryId: string): string | null {
  const category = getCategoryDoc(categoryId);
  if (!category) {
    return null;
  }
  return categoryToMarkdownDoc(category);
}

/**
 * Get brief index Markdown with category summaries
 */
export function getIndexMarkdown(): string {
  const index = getWikiIndex();
  let md = "# Hikki API Documentation\n\n";
  md += `${index.description}\n\n`;
  md += "---\n\n";
  md += "## Categorías\n\n";

  for (const cat of index.categories) {
    md += `### ${cat.name}\n`;
    md += `${cat.description}\n\n`;
    md += `- **Endpoints:** ${cat.endpoint_count}\n`;
    md += `- **Ver más:** \`/docs/ai?category=${cat.id}\`\n\n`;
  }

  md += "---\n\n";
  md += "**Ver documentación completa:** `/docs/ai?category=all`\n";

  return md;
}
