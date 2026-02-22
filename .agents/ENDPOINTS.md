# Hikki API Endpoints Guide

Quick reference for API endpoints and how to consume them from the frontend.

---

## API Base URLs
- **API Server**: `http://localhost:7300`
- **Web Proxy**: `http://localhost:7500` (for development)

> **Note**: When using the web app, requests go through the proxy at `/api/v1/*`.

---

## Response Format

All endpoints return:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "timestamp": "ISO8601"
}
```

---

## Frontend: Using Repositories

Frontend hooks use **repositories** located at `apps/web/lib/repositories/`.

### Messages Repository

```typescript
import { messagesRepository } from "@/lib/repositories/messages-repository";

// Get messages for a thread
const messages = await messagesRepository.getByThread(threadId, { limit: 10, offset: 0 });
```

### Limits Repository

```typescript
import { limitsRepository } from "@/lib/repositories/limits-repository";

// Get system limits
const limits = await limitsRepository.get();
```

---

## Available Endpoints

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Send a message and get AI response |

**Request:**
```json
{
  "message": "Hello",
  "threadId": "uuid (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": { ... },
    "threadId": "uuid"
  }
}
```

---

### Threads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/threads` | List all threads |
| POST | `/api/v1/threads` | Create new thread |
| GET | `/api/v1/threads/:id` | Get thread by ID |
| GET | `/api/v1/threads/:id/messages` | Get messages for thread |

---

### Limits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/limits` | Get system limits |

**Response:**
```json
{
  "success": true,
  "data": {
    "maxMessageLength": 4000,
    "maxMessages": 10
  }
}
```

---

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh` | Refresh token |

---

### AI Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ai/models` | List available AI models |
| GET | `/api/v1/ai/providers` | List AI providers |

---

## Error Handling

```typescript
try {
  const response = await api.get("/api/v1/threads").json();
  if (!response.success) {
    console.error(response.message);
  }
} catch (error) {
  console.error("Request failed:", error);
}
```

---

## Adding New Endpoints

1. Create endpoint definition in `apps/api/src/data/endpoints/<feature>.json`
2. Register route in `apps/api/src/index.ts`
3. If frontend needed, create repository in `apps/web/lib/repositories/`
4. Update this guide with endpoint details
