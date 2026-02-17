/**
 * AI Documentation Routes - Wiki Style
 *
 * Provides wiki-style documentation endpoints for AI agents:
 * - /api/v1/docs/ai           -> Wiki index (list of categories)
 * - /api/v1/docs/ai/:category -> Category documentation
 * - /api/v1/docs/ai/all       -> All endpoints at once
 */

import { Elysia, t } from "elysia";
import {
  getAllEndpointsDoc,
  getCategoryDoc,
  getCategoryIds,
  getWikiIndex,
} from "../../services/ai-endpoint-registry";

const FieldDefinitionSchema = t.Object({
  type: t.String(),
  required: t.Boolean(),
  description: t.String(),
  constraints: t.Optional(t.String()),
  example: t.Optional(t.Unknown()),
});

const RequestSchema = t.Object({
  body: t.Optional(t.Record(t.String(), FieldDefinitionSchema)),
  query: t.Optional(t.Record(t.String(), FieldDefinitionSchema)),
  params: t.Optional(t.Record(t.String(), FieldDefinitionSchema)),
  headers: t.Optional(t.Record(t.String(), t.String())),
});

const ResponseSchema = t.Object({
  description: t.String(),
  body: t.Optional(t.Record(t.String(), FieldDefinitionSchema)),
});

const ExampleSchema = t.Object({
  summary: t.String(),
  description: t.Optional(t.String()),
  request: t.Optional(t.Unknown()),
  response: t.Optional(t.Unknown()),
});

const RateLimitSchema = t.Object({
  requests: t.Number(),
  window: t.String(),
  description: t.String(),
});

const AIEndpointDocSchema = t.Object({
  name: t.String(),
  what_it_does: t.String(),
  when_to_use: t.String(),
  how_to_use: t.String(),
  path: t.String(),
  method: t.String(),
  requires_auth: t.Boolean(),
  tags: t.Array(t.String()),
  request: t.Optional(RequestSchema),
  responses: t.Record(t.String(), ResponseSchema),
  examples: t.Optional(t.Array(ExampleSchema)),
  rate_limit: t.Optional(RateLimitSchema),
});

const CategoryIndexSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  endpoint_count: t.Number(),
  url: t.String(),
});

const CategoryDocSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  total_endpoints: t.Number(),
  endpoints: t.Array(AIEndpointDocSchema),
});

const WikiIndexSchema = t.Object({
  version: t.String(),
  description: t.String(),
  total_categories: t.Number(),
  categories: t.Array(CategoryIndexSchema),
  metadata: t.Object({
    base_url: t.String(),
    total_endpoints: t.Number(),
  }),
  all_endpoints_url: t.String(),
});

const AllEndpointsSchema = t.Object({
  version: t.String(),
  total_endpoints: t.Number(),
  categories: t.Array(CategoryDocSchema),
  metadata: t.Object({
    base_url: t.String(),
    generated_at: t.String(),
  }),
});

const getWikiIndexHandler = () => {
  return {
    success: true,
    data: getWikiIndex(),
  };
};

const getCategoryHandler = ({ params }: { params: { category: string } }) => {
  const doc = getCategoryDoc(params.category);

  if (!doc) {
    return {
      success: false,
      error: `Category '${params.category}' not found. Available categories: ${getCategoryIds().join(", ")}`,
    };
  }

  return {
    success: true,
    data: doc,
  };
};

const getAllEndpointsHandler = () => {
  return {
    success: true,
    data: getAllEndpointsDoc(),
  };
};

export const aiDocsRoutes = new Elysia({ prefix: "" })

  .get("/", getWikiIndexHandler, {
    detail: {
      summary: "API Documentation Wiki Index",
      description:
        "Get the wiki index with all available documentation categories. Start here to discover the API.",
      tags: ["AI Documentation"],
    },
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: WikiIndexSchema,
      }),
    },
  })

  .get("/all", getAllEndpointsHandler, {
    detail: {
      summary: "All API Documentation",
      description:
        "Get complete documentation for all API endpoints from all categories at once.",
      tags: ["AI Documentation"],
    },
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: AllEndpointsSchema,
      }),
    },
  })

  .get("/:category", getCategoryHandler, {
    detail: {
      summary: "Category Documentation",
      description:
        "Get full documentation for a specific category (authentication, threads, chat, ai-discovery).",
      tags: ["AI Documentation"],
    },
    params: t.Object({
      category: t.String({
        description: "Category identifier (kebab-case)",
        examples: ["authentication", "threads", "chat", "ai-discovery"],
      }),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: CategoryDocSchema,
      }),
      404: t.Object({
        success: t.Boolean(),
        error: t.String(),
      }),
    },
  });
