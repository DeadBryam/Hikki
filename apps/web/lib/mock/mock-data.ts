/**
 * Mock data for chat UI development
 * These will be replaced with real API calls later
 */

export interface Conversation {
  date: string;
  id: string;
  isPinned?: boolean;
  messageCount: number;
  title: string;
}

export interface Memory {
  content: string;
  date: string;
  id: string;
  source?: string;
  tags: string[];
}

export interface Job {
  description?: string;
  id: string;
  lastRun?: string;
  name: string;
  nextRun: string;
  schedule: string;
  status: "running" | "pending" | "completed" | "failed";
}

export interface Reminder {
  category?: string;
  completed: boolean;
  dueDate: string;
  id: string;
  priority: "low" | "medium" | "high";
  text: string;
}

export interface Message {
  content: string;
  id: string;
  model?: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Revisión de código React",
    date: new Date(Date.now() - 5 * 60_000).toISOString(),
    messageCount: 12,
    isPinned: true,
  },
  {
    id: "2",
    title: "Planificación sprint Q1",
    date: new Date(Date.now() - 45 * 60_000).toISOString(),
    messageCount: 8,
    isPinned: true,
  },
  {
    id: "3",
    title: "Optimización de queries SQL",
    date: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    messageCount: 6,
  },
  {
    id: "4",
    title: "Diseño de arquitectura microservicios",
    date: new Date(Date.now() - 5 * 3_600_000).toISOString(),
    messageCount: 15,
  },
  {
    id: "5",
    title: "Debugging issue de autenticación",
    date: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    messageCount: 23,
  },
  {
    id: "6",
    title: "Configuración CI/CD pipeline",
    date: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    messageCount: 9,
  },
  {
    id: "7",
    title: "Documentación API REST",
    date: new Date(Date.now() - 48 * 3_600_000).toISOString(),
    messageCount: 4,
  },
  {
    id: "8",
    title: "Implementación WebSocket",
    date: new Date(Date.now() - 72 * 3_600_000).toISOString(),
    messageCount: 18,
  },
  {
    id: "9",
    title: "Análisis de performance frontend",
    date: new Date(Date.now() - 96 * 3_600_000).toISOString(),
    messageCount: 11,
  },
  {
    id: "10",
    title: "Migración a TypeScript",
    date: new Date(Date.now() - 168 * 3_600_000).toISOString(),
    messageCount: 7,
  },
];

export const mockMemories: Memory[] = [
  {
    id: "1",
    content:
      "Usuario prefiere TypeScript sobre JavaScript para nuevos proyectos. Valora el type safety y la experiencia de desarrollo.",
    tags: ["#tech", "#preferences", "#typescript"],
    date: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    source: "Conversación sobre stack tecnológico",
  },
  {
    id: "2",
    content:
      "Proyecto principal actual: SaaS de analytics para e-commerce. Stack: Next.js, PostgreSQL, Prisma, Tailwind.",
    tags: ["#project", "#work", "#stack"],
    date: new Date(Date.now() - 48 * 3_600_000).toISOString(),
    source: "Onboarding conversation",
  },
  {
    id: "3",
    content:
      "Horario preferido: Mañanas para code review, tardes para desarrollo profundo. No disponible 12pm-1pm (almuerzo).",
    tags: ["#schedule", "#preferences"],
    date: new Date(Date.now() - 72 * 3_600_000).toISOString(),
    source: "Conversación sobre organización",
  },
  {
    id: "4",
    content:
      "Intereses: Machine Learning, DevOps, arquitectura de software. Actualmente aprendiendo Rust.",
    tags: ["#interests", "#learning"],
    date: new Date(Date.now() - 120 * 3_600_000).toISOString(),
    source: "Conversación personal",
  },
  {
    id: "5",
    content:
      "Equipo: 5 developers full-stack, 1 PM, 1 designer. Comunicación principal via Slack y Notion.",
    tags: ["#team", "#work"],
    date: new Date(Date.now() - 168 * 3_600_000).toISOString(),
    source: "Team overview discussion",
  },
  {
    id: "6",
    content:
      "Preocupación actual: Escalabilidad de la base de datos con el crecimiento de usuarios. Considerando sharding.",
    tags: ["#concern", "#database", "#scaling"],
    date: new Date(Date.now() - 12 * 3_600_000).toISOString(),
    source: "Technical discussion",
  },
];

export const mockJobs: Job[] = [
  {
    id: "1",
    name: "Daily Database Backup",
    schedule: "0 0 * * *",
    status: "running",
    nextRun: new Date(Date.now() + 12 * 3_600_000).toISOString(),
    lastRun: new Date(Date.now() - 12 * 3_600_000).toISOString(),
    description: "Full backup of PostgreSQL to S3",
  },
  {
    id: "2",
    name: "Email Digest Generator",
    schedule: "0 9 * * 1-5",
    status: "pending",
    nextRun: new Date(Date.now() + 3 * 3_600_000).toISOString(),
    description: "Daily summary emails for team",
  },
  {
    id: "3",
    name: "Analytics Aggregation",
    schedule: "0 */6 * * *",
    status: "completed",
    nextRun: new Date(Date.now() + 6 * 3_600_000).toISOString(),
    lastRun: new Date(Date.now() - 10 * 60_000).toISOString(),
    description: "Process and aggregate user events",
  },
  {
    id: "4",
    name: "Log Rotation",
    schedule: "0 2 * * 0",
    status: "pending",
    nextRun: new Date(Date.now() + 48 * 3_600_000).toISOString(),
    description: "Compress and archive old logs",
  },
  {
    id: "5",
    name: "Security Scan",
    schedule: "0 3 * * 1",
    status: "failed",
    nextRun: new Date(Date.now() + 72 * 3_600_000).toISOString(),
    lastRun: new Date(Date.now() - 96 * 3_600_000).toISOString(),
    description: "Weekly vulnerability assessment",
  },
];

export const mockReminders: Reminder[] = [
  {
    id: "1",
    text: "Reunión de planning con el equipo",
    completed: false,
    priority: "high",
    dueDate: new Date(Date.now() + 2 * 3_600_000).toISOString(),
    category: "Meeting",
  },
  {
    id: "2",
    text: "Revisar PRs pendientes",
    completed: false,
    priority: "medium",
    dueDate: new Date(Date.now() + 4 * 3_600_000).toISOString(),
    category: "Development",
  },
  {
    id: "3",
    text: "Enviar reporte semanal",
    completed: true,
    priority: "medium",
    dueDate: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    category: "Reporting",
  },
  {
    id: "4",
    text: "Actualizar documentación API",
    completed: false,
    priority: "low",
    dueDate: new Date(Date.now() + 48 * 3_600_000).toISOString(),
    category: "Documentation",
  },
  {
    id: "5",
    text: "Configurar monitoreo nuevo servicio",
    completed: false,
    priority: "high",
    dueDate: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    category: "DevOps",
  },
];

export const mockInitialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "¡Hola! Soy Hikki, tu asistente AI. Puedo ayudarte con:\n\n• **Desarrollo de software** - Code review, debugging, arquitectura\n• **Análisis de datos** - Queries, visualizaciones, insights\n• **Planificación** - Sprint planning, estimaciones, priorización\n• **Aprendizaje** - Explicaciones, recursos, ejercicios\n\n¿En qué puedo ayudarte hoy?",
    timestamp: new Date(),
    model: "gemini-pro",
  },
];

export const mockChatHistory: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Necesito ayuda optimizando una query SQL que está lenta",
    timestamp: new Date(Date.now() - 3_600_000),
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Claro, con gusto te ayudo a optimizar esa query. Para darte las mejores recomendaciones, necesito ver:\n\n1. La query actual\n2. El esquema de las tablas involucradas\n3. Un EXPLAIN ANALYZE si es posible\n4. La cantidad aproximada de registros\n\n¿Me puedes compartir la query que está causando problemas?",
    timestamp: new Date(Date.now() - 3_500_000),
    model: "gemini-pro",
  },
  {
    id: "3",
    role: "user",
    content:
      "Es un JOIN entre orders y order_items, con un GROUP BY que agrupa por fecha",
    timestamp: new Date(Date.now() - 3_400_000),
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Entiendo. Los JOINs con GROUP BY pueden ser costosos si no tienen los índices adecuados. Algunas recomendaciones generales:\n\n**Índices recomendados:**\n```sql\nCREATE INDEX idx_orders_date ON orders(created_at);\nCREATE INDEX idx_order_items_order_id ON order_items(order_id);\n```\n\n**Considera también:**\n- Materialized views si los datos no cambian frecuentemente\n- Partitioning por fecha si la tabla es muy grande\n- Covering indexes que incluyan las columnas del SELECT\n\n¿Me compartes el query exacto para revisar los campos específicos?",
    timestamp: new Date(Date.now() - 3_300_000),
    model: "gemini-pro",
  },
];

export const mockMessagesByConversation: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      role: "user",
      content: "¿Puedes explicarme cómo funciona React Server Components?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "React Server Components (RSC) son una arquitectura que permite renderizar componentes React en el servidor. Esto ofrece varias ventajas:\n\n1. **Reducción de bundle size**: El código del componente nunca llega al cliente\n2. **Acceso directo a recursos del backend**: Puedes consultar bases de datos directamente\n3. **Mejor rendimiento inicial**: Menos JavaScript en el cliente\n\nLos Server Components pueden importar y renderizar Client Components, pero no al revés. Esto crea una separación clara entre la lógica del servidor y la interactividad del cliente.",
      timestamp: new Date(Date.now() - 1000 * 60 * 29),
    },
  ],
  "2": [
    {
      id: "1",
      role: "user",
      content: "Help me design a database schema for an e-commerce app",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Here's a comprehensive database schema for an e-commerce application:\n\n**Core Tables:**\n- `users` (id, email, password_hash, created_at)\n- `products` (id, name, description, price, stock, category_id)\n- `categories` (id, name, parent_id)\n- `orders` (id, user_id, status, total, created_at)\n- `order_items` (id, order_id, product_id, quantity, price)\n\n**Additional Tables:**\n- `addresses` (id, user_id, street, city, postal_code)\n- `reviews` (id, product_id, user_id, rating, comment)\n- `shopping_cart` (id, user_id, product_id, quantity)\n\nWould you like me to elaborate on any specific table or relationship?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60),
    },
  ],
  "3": [
    {
      id: "1",
      role: "user",
      content: "Write a Python function to calculate fibonacci numbers",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Here's an efficient Python implementation using memoization:\n\n```python\ndef fibonacci(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)\n    return memo[n]\n\n# Usage examples\nprint(fibonacci(10))  # 55\nprint(fibonacci(50))  # 12586269025\n```\n\nThis approach has O(n) time complexity and avoids redundant calculations.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 30),
    },
  ],
  "5": [
    {
      id: "1",
      role: "user",
      content: "What are the best practices for API security?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Here are essential API security best practices:\n\n1. **Authentication & Authorization**\n   - Use OAuth 2.0 or JWT tokens\n   - Implement RBAC (Role-Based Access Control)\n   - Use short-lived access tokens with refresh tokens\n\n2. **Input Validation**\n   - Validate all input data (size, type, format)\n   - Use parameterized queries to prevent SQL injection\n   - Implement rate limiting\n\n3. **HTTPS & Transport Security**\n   - Enforce HTTPS for all endpoints\n   - Use HSTS headers\n   - Implement proper CORS policies\n\n4. **Monitoring & Logging**\n   - Log all authentication attempts\n   - Monitor for suspicious patterns\n   - Set up alerts for anomalies",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000 * 60 * 2),
    },
  ],
  "8": [
    {
      id: "1",
      role: "user",
      content: "Explain quantum computing basics",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Quantum computing leverages quantum mechanical phenomena to process information:\n\n**Key Concepts:**\n\n1. **Qubits**: Unlike classical bits (0 or 1), qubits can exist in superposition (both states simultaneously)\n\n2. **Superposition**: Allows quantum computers to explore many possibilities at once\n\n3. **Entanglement**: Qubits can be correlated in ways that classical bits cannot, enabling powerful computations\n\n4. **Quantum Gates**: Manipulate qubits through operations like Hadamard, CNOT, and phase shifts\n\n**Applications:**\n- Cryptography (Shor's algorithm)\n- Drug discovery\n- Optimization problems\n- Machine learning\n\nWhile still in early stages, quantum computers show promise for solving problems intractable for classical computers.",
      timestamp: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 5
      ),
    },
  ],
};

export const quickSuggestions = [
  {
    icon: "📝",
    text: "Resumir un texto largo",
    prompt: "Resume este texto para mí...",
  },
  {
    icon: "💻",
    text: "Revisar código",
    prompt: "Revisa este código y dime posibles mejoras...",
  },
  {
    icon: "📊",
    text: "Analizar datos",
    prompt: "Ayúdame a analizar estos datos...",
  },
  {
    icon: "🎨",
    text: "Crear diseño UI",
    prompt: "Sugiéreme un diseño para...",
  },
  {
    icon: "🐛",
    text: "Debuggear error",
    prompt: "Tengo este error: [pega el error]",
  },
  {
    icon: "📚",
    text: "Explicar concepto",
    prompt: "Explícame como si tuviera 5 años...",
  },
];

export const groupConversationsByDate = (conversations: Conversation[]) => {
  const groups: { [key: string]: Conversation[] } = {
    Pinned: [],
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const last7Days = new Date(today.getTime() - 7 * 86_400_000);
  const last30Days = new Date(today.getTime() - 30 * 86_400_000);

  for (const conv of conversations) {
    const convDate = new Date(conv.date);

    if (conv.isPinned) {
      groups.Pinned.push(conv);
    } else if (convDate >= today) {
      groups.Today.push(conv);
    } else if (convDate >= yesterday) {
      groups.Yesterday.push(conv);
    } else if (convDate >= last7Days) {
      groups["Last 7 days"].push(conv);
    } else if (convDate >= last30Days) {
      groups["Last 30 days"].push(conv);
    } else {
      groups.Older.push(conv);
    }
  }

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
};

export const formatRelativeTime = (dateString: string): string => {
  return getRelativeTime(new Date(dateString));
};

export const formatJobTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffHours < 1) {
    return "Soon";
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  return `${diffDays}d`;
};
