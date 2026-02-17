/**
 * AI Endpoint Registry - Wiki Style
 *
 * Organizes endpoints by category for easy discovery by AI agents.
 */

import type {
  AIAllEndpointsDoc,
  AICategoryDoc,
  AIEndpointDoc,
  AIWikiIndex,
} from "../types/ai-endpoints";

const CATEGORIES: Record<
  string,
  { id: string; name: string; description: string }
> = {
  authentication: {
    id: "authentication",
    name: "Authentication",
    description: "User signup, login, logout and session management",
  },
  threads: {
    id: "threads",
    name: "Conversation Threads",
    description: "Manage conversation threads for AI chat",
  },
  chat: {
    id: "chat",
    name: "AI Chat",
    description: "Send messages and interact with the AI assistant",
  },
  "ai-discovery": {
    id: "ai-discovery",
    name: "AI Discovery",
    description: "Documentation and discovery endpoints for AI agents",
  },
};

const ENDPOINTS_BY_CATEGORY: Record<string, AIEndpointDoc[]> = {
  authentication: [
    {
      name: "User Registration",
      what_it_does:
        "Creates a new user account with username, email, and password",
      when_to_use:
        "When a new user wants to create an account to access the application",
      how_to_use:
        "Send a POST request with username, email, and password. Returns user info and session token on success.",
      path: "/api/v1/auth/signup",
      method: "POST",
      requires_auth: false,
      tags: ["Authentication"],
      request: {
        body: {
          username: {
            type: "string",
            required: true,
            description: "Unique username for the account",
            constraints: "3-50 characters, alphanumeric",
            example: "johndoe",
          },
          email: {
            type: "string",
            required: true,
            description: "User's email address",
            constraints: "Valid email format",
            example: "john@example.com",
          },
          password: {
            type: "string",
            required: true,
            description: "User's password",
            constraints: "8-128 characters, must meet security requirements",
            example: "SecurePass123!",
          },
        },
      },
      responses: {
        "201": {
          description:
            "User created successfully. Returns user data and token.",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true on success",
            },
            message: {
              type: "string",
              required: true,
              description: "Success message",
            },
            data: {
              type: "object",
              required: true,
              description: "Contains user info and session token",
            },
          },
        },
        "400": {
          description: "Validation error or user already exists",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always false on error",
            },
            error: {
              type: "string",
              required: true,
              description: "Error message explaining what went wrong",
            },
          },
        },
      },
      examples: [
        {
          summary: "Successful registration",
          description: "Creating a new user account",
          request: {
            username: "johndoe",
            email: "john@example.com",
            password: "SecurePass123!",
          },
          response: {
            success: true,
            message: "User created successfully",
            data: {
              user: {
                id: "uuid",
                username: "johndoe",
                email: "john@example.com",
              },
              token: "session_token_here",
            },
          },
        },
      ],
      rate_limit: {
        requests: 5,
        window: "15 minutes",
        description: "Prevent abuse and spam registrations",
      },
    },
    {
      name: "User Login",
      what_it_does: "Authenticates an existing user with username and password",
      when_to_use:
        "When an existing user wants to access their account and get a session token",
      how_to_use:
        "Send username and password. Returns session token on successful authentication.",
      path: "/api/v1/auth/login",
      method: "POST",
      requires_auth: false,
      tags: ["Authentication"],
      request: {
        body: {
          username: {
            type: "string",
            required: true,
            description: "User's username",
            example: "johndoe",
          },
          password: {
            type: "string",
            required: true,
            description: "User's password",
            example: "SecurePass123!",
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true on success",
            },
            message: {
              type: "string",
              required: true,
              description: "Success message",
            },
            data: {
              type: "object",
              required: true,
              description: "Contains user info and session token",
            },
          },
        },
        "400": {
          description: "Invalid credentials",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always false on error",
            },
            error: {
              type: "string",
              required: true,
              description: "Error message",
            },
          },
        },
      },
      examples: [
        {
          summary: "Successful login",
          request: {
            username: "johndoe",
            password: "SecurePass123!",
          },
          response: {
            success: true,
            message: "Login successful",
            data: {
              user: {
                id: "uuid",
                username: "johndoe",
                email: "john@example.com",
              },
              token: "session_token_here",
            },
          },
        },
      ],
      rate_limit: {
        requests: 10,
        window: "5 minutes",
        description: "Prevent brute force attacks",
      },
    },
    {
      name: "Verify Session",
      what_it_does: "Checks if a session token is valid and returns user info",
      when_to_use:
        "When you need to validate a token on app startup or before making authenticated requests",
      how_to_use:
        "Send the session token in the Authorization header. Returns user details if valid.",
      path: "/api/v1/auth/verify",
      method: "POST",
      requires_auth: true,
      tags: ["Authentication"],
      request: {
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "200": {
          description: "Token is valid",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true",
            },
            data: {
              type: "object",
              required: true,
              description: "User details",
            },
          },
        },
        "401": {
          description: "Token is invalid or expired",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always false",
            },
            error: {
              type: "string",
              required: true,
              description: "Authentication error message",
            },
          },
        },
      },
    },
    {
      name: "User Logout",
      what_it_does: "Invalidates the current session token",
      when_to_use: "When a user wants to log out and end their session",
      how_to_use:
        "Send the session token in the Authorization header. The token will be invalidated.",
      path: "/api/v1/auth/logout",
      method: "POST",
      requires_auth: true,
      tags: ["Authentication"],
      request: {
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "200": {
          description: "Logout successful",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true",
            },
            message: {
              type: "string",
              required: true,
              description: "Success message",
            },
          },
        },
      },
    },
  ],
  threads: [
    {
      name: "List Threads",
      what_it_does:
        "Gets all conversation threads belonging to the authenticated user",
      when_to_use: "When you want to show the user their conversation history",
      how_to_use:
        "Send a GET request with optional pagination parameters. Returns paginated list of threads.",
      path: "/api/v1/threads",
      method: "GET",
      requires_auth: true,
      tags: ["Threads"],
      request: {
        query: {
          limit: {
            type: "number",
            required: false,
            description: "Number of threads to return",
            constraints: "Default: 20, Max: 100",
            example: 20,
          },
          offset: {
            type: "number",
            required: false,
            description: "Number of threads to skip",
            constraints: "Default: 0",
            example: 0,
          },
        },
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "200": {
          description: "List of threads retrieved",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true",
            },
            data: {
              type: "array",
              required: true,
              description: "Array of thread objects",
            },
            pagination: {
              type: "object",
              required: true,
              description: "Pagination info (total, limit, offset)",
            },
          },
        },
      },
      examples: [
        {
          summary: "Get first page of threads",
          request: { limit: 20, offset: 0 },
          response: {
            success: true,
            data: [
              {
                id: "thread_uuid",
                title: "My Conversation",
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
              },
            ],
            pagination: {
              total: 50,
              limit: 20,
              offset: 0,
            },
          },
        },
      ],
    },
    {
      name: "Create Thread",
      what_it_does: "Creates a new conversation thread",
      when_to_use:
        "When the user wants to start a new conversation with the AI",
      how_to_use:
        "Send a POST request with optional title. Returns the created thread object.",
      path: "/api/v1/threads",
      method: "POST",
      requires_auth: true,
      tags: ["Threads"],
      request: {
        body: {
          title: {
            type: "string",
            required: false,
            description: "Name for the thread",
            constraints: "Optional, max 100 characters",
            example: "Project Planning Discussion",
          },
        },
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "201": {
          description: "Thread created successfully",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true",
            },
            data: {
              type: "object",
              required: true,
              description: "Thread object with id, title, timestamps",
            },
          },
        },
      },
      examples: [
        {
          summary: "Create a thread with title",
          request: { title: "Project Planning Discussion" },
          response: {
            success: true,
            data: {
              id: "new_thread_uuid",
              title: "Project Planning Discussion",
              createdAt: "2026-01-01T00:00:00Z",
              updatedAt: "2026-01-01T00:00:00Z",
            },
          },
        },
      ],
    },
    {
      name: "Get Thread",
      what_it_does: "Gets detailed information about a specific thread",
      when_to_use:
        "When you want to view a complete conversation with all messages",
      how_to_use:
        "Send the thread ID in the URL. Returns thread details including all messages.",
      path: "/api/v1/threads/:id",
      method: "GET",
      requires_auth: true,
      tags: ["Threads"],
      request: {
        params: {
          id: {
            type: "string",
            required: true,
            description: "Thread identifier (UUID)",
            example: "thread-uuid-123",
          },
        },
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "200": {
          description: "Thread details retrieved",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true",
            },
            data: {
              type: "object",
              required: true,
              description: "Thread with messages array",
            },
          },
        },
        "404": {
          description: "Thread not found",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always false",
            },
            error: {
              type: "string",
              required: true,
              description: "Not found message",
            },
          },
        },
      },
    },
    {
      name: "Delete Thread",
      what_it_does: "Permanently deletes a thread and all its messages",
      when_to_use: "When the user wants to remove a conversation permanently",
      how_to_use:
        "Send the thread ID in the URL. This action cannot be undone.",
      path: "/api/v1/threads/:id",
      method: "DELETE",
      requires_auth: true,
      tags: ["Threads"],
      request: {
        params: {
          id: {
            type: "string",
            required: true,
            description: "Thread identifier (UUID)",
          },
        },
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "200": {
          description: "Thread deleted successfully",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true",
            },
            message: {
              type: "string",
              required: true,
              description: "Deletion confirmation",
            },
          },
        },
      },
    },
  ],
  chat: [
    {
      name: "Send Chat Message",
      what_it_does: "Sends a message to the AI assistant and gets a response",
      when_to_use: "When the user wants to chat with the AI assistant",
      how_to_use:
        "Send threadId and message content. The message is stored and AI responds automatically.",
      path: "/api/v1/chat",
      method: "POST",
      requires_auth: true,
      tags: ["Chat"],
      request: {
        body: {
          threadId: {
            type: "string",
            required: true,
            description: "Thread to add the message to",
            example: "thread-uuid-123",
          },
          content: {
            type: "string",
            required: true,
            description: "User message content",
            constraints: "1-4000 characters",
            example: "Hello! Can you help me plan my day?",
          },
        },
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "200": {
          description: "Message sent and AI responded",
          body: {
            success: {
              type: "boolean",
              required: true,
              description: "Always true",
            },
            data: {
              type: "object",
              required: true,
              description: "Contains user message and AI response",
            },
          },
        },
        "400": {
          description: "Invalid thread ID or content",
        },
        "404": {
          description: "Thread not found",
        },
      },
      examples: [
        {
          summary: "Send message to AI",
          request: {
            threadId: "thread_uuid",
            content: "Hello! Can you help me plan my day?",
          },
          response: {
            success: true,
            data: {
              userMessage: {
                id: "msg_uuid_1",
                role: "user",
                content: "Hello! Can you help me plan my day?",
                timestamp: "2026-01-01T00:00:00Z",
              },
              aiResponse: {
                id: "msg_uuid_2",
                role: "assistant",
                content:
                  "I'd be happy to help you plan your day! What tasks do you have ahead?",
                timestamp: "2026-01-01T00:00:01Z",
              },
            },
          },
        },
      ],
      rate_limit: {
        requests: 50,
        window: "1 minute",
        description: "Prevent API abuse and manage AI costs",
      },
    },
    {
      name: "Get Chat History",
      what_it_does: "Retrieves paginated message history from a thread",
      when_to_use:
        "When loading previous messages or implementing infinite scroll",
      how_to_use:
        "Send threadId and optional pagination params. Returns messages in chronological order.",
      path: "/api/v1/chat/:threadId/history",
      method: "GET",
      requires_auth: true,
      tags: ["Chat"],
      request: {
        params: {
          threadId: {
            type: "string",
            required: true,
            description: "Thread identifier",
          },
        },
        query: {
          limit: {
            type: "number",
            required: false,
            description: "Messages to return",
            constraints: "Default: 50",
          },
          before: {
            type: "string",
            required: false,
            description: "Get messages before this timestamp",
            constraints: "ISO 8601 format",
          },
        },
        headers: {
          Authorization: "Bearer {token}",
        },
      },
      responses: {
        "200": {
          description: "Chat history retrieved",
        },
      },
    },
  ],
  "ai-discovery": [
    {
      name: "API Documentation Index",
      what_it_does:
        "Returns the wiki index with all available documentation categories",
      when_to_use:
        "Call this first when learning about the API. Shows all categories and their URLs.",
      how_to_use:
        "Send a GET request. No authentication required. Returns index of categories.",
      path: "/api/v1/docs/ai",
      method: "GET",
      requires_auth: false,
      tags: ["AI Discovery"],
      responses: {
        "200": {
          description: "Wiki index retrieved",
          body: {
            version: {
              type: "string",
              required: true,
              description: "API version",
            },
            total_categories: {
              type: "number",
              required: true,
              description: "Number of categories",
            },
            categories: {
              type: "array",
              required: true,
              description: "List of category summaries",
            },
          },
        },
      },
    },
    {
      name: "Category Documentation",
      what_it_does: "Returns all endpoints for a specific category",
      when_to_use:
        "After getting the index, call the URL of the category you want to explore.",
      how_to_use:
        "Send the category ID (kebab-case) in the URL. Returns full documentation for that category.",
      path: "/api/v1/docs/ai/:category",
      method: "GET",
      requires_auth: false,
      tags: ["AI Discovery"],
      request: {
        params: {
          category: {
            type: "string",
            required: true,
            description: "Category identifier (kebab-case)",
            example: "authentication",
          },
        },
      },
      responses: {
        "200": {
          description: "Category documentation retrieved",
        },
        "404": {
          description: "Category not found",
        },
      },
    },
    {
      name: "All Endpoints Documentation",
      what_it_does: "Returns all API endpoints from all categories at once",
      when_to_use:
        "When you need the complete API documentation in a single request",
      how_to_use:
        "Send a GET request. Returns all endpoints grouped by category.",
      path: "/api/v1/docs/ai/all",
      method: "GET",
      requires_auth: false,
      tags: ["AI Discovery"],
      responses: {
        "200": {
          description: "All endpoints retrieved",
          body: {
            version: {
              type: "string",
              required: true,
              description: "API version identifier",
            },
            total_endpoints: {
              type: "number",
              required: true,
              description: "Total number of available endpoints",
            },
            categories: {
              type: "array",
              required: true,
              description: "List of endpoint categories",
            },
          },
        },
      },
    },
  ],
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
    url: `/api/v1/docs/ai/${cat.id}`,
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
    all_endpoints_url: "/api/v1/docs/ai/all",
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
