/**
 * Types for AI-friendly endpoint documentation
 * Structured in wiki-style with categories
 */

/**
 * Individual endpoint documentation with descriptive field names
 */
export interface AIEndpointDoc {
  /** Example usage */
  examples?: {
    summary: string;
    description?: string;
    request?: unknown;
    response?: unknown;
  }[];
  /** How to use this endpoint */
  how_to_use: string;
  /** HTTP method */
  method: string;
  /** Human-readable name of the endpoint */
  name: string;
  /** HTTP path */
  path: string;
  /** Rate limiting information */
  rate_limit?: {
    requests: number;
    window: string;
    description: string;
  };
  /** Request structure */
  request?: {
    /** Body parameters */
    body?: Record<string, FieldDefinition>;
    /** Query parameters */
    query?: Record<string, FieldDefinition>;
    /** Path parameters */
    params?: Record<string, FieldDefinition>;
    /** Required headers */
    headers?: Record<string, string>;
  };
  /** Whether authentication is required */
  requires_auth: boolean;
  /** Response structure by status code */
  responses: Record<
    string,
    {
      description: string;
      body?: Record<string, FieldDefinition>;
    }
  >;
  /** Tags for categorization */
  tags: string[];
  /** What this endpoint does in plain language */
  what_it_does: string;
  /** When should this endpoint be used */
  when_to_use: string;
}

/**
 * Definition of a field in request/response */
export interface FieldDefinition {
  /** Constraints or format */
  constraints?: string;
  /** Human-readable description */
  description: string;
  /** Example value */
  example?: unknown;
  /** Whether field is required */
  required: boolean;
  /** Data type */
  type: string;
}

/**
 * Category information for the index */
export interface AICategoryIndex {
  /** What this category contains */
  description: string;
  /** Number of endpoints in this category */
  endpoint_count: number;
  /** Category identifier (kebab-case) */
  id: string;
  /** Display name */
  name: string;
  /** URL to get full category documentation */
  url: string;
}

/**
 * Complete category documentation */
export interface AICategoryDoc {
  /** Description of the category */
  description: string;
  /** List of endpoints */
  endpoints: AIEndpointDoc[];
  /** Category identifier */
  id: string;
  /** Display name */
  name: string;
  /** Total endpoints in this category */
  total_endpoints: number;
}

/**
 * Wiki index response */
export interface AIWikiIndex {
  /** URL to get all endpoints at once */
  all_endpoints_url: string;
  /** List of available categories */
  categories: AICategoryIndex[];
  /** Description of this documentation */
  description: string;
  /** Metadata */
  metadata: {
    base_url: string;
    total_endpoints: number;
  };
  /** Total number of categories */
  total_categories: number;
  /** API version */
  version: string;
}

/**
 * All endpoints response */
export interface AIAllEndpointsDoc {
  /** Endpoints grouped by category */
  categories: AICategoryDoc[];
  /** Metadata */
  metadata: {
    base_url: string;
    generated_at: string;
  };
  /** Total endpoints */
  total_endpoints: number;
  /** API version */
  version: string;
}
