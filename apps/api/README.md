# 🚀 Hikki API

Backend API for the Hikki AI assistant, built with ElysiaJS and Bun.

## ✨ Features

- ⚡ **ElysiaJS**: Ultra-fast web framework for Bun
- 🗄️ **Drizzle ORM**: Type-safe SQL with SQLite
- 🤖 **Multi-AI Providers**: Cerebras and Groq integration
- 📧 **Resend**: Email sending system
- 🔐 **Authentication**: Session-based with bcrypt and email verification
- 📝 **Swagger**: Automatic API documentation
- 🛡️ **Security**: Rate limiting and input validation
- 🎯 **Zod**: Type-safe data validation
- 🏗️ **Dependency Injection**: Awilix for clean architecture
- 📋 **Background Jobs**: Queue system for async tasks

## 🚀 Quick Start

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **SQLite** (included)

### Installation and development

```bash
# From the monorepo root
cd apps/api

# Install dependencies
bun install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the database
bun run db:migrate

# Start development
bun run dev
```

## 📁 Structure

```
apps/api/
├── src/
│   ├── index.ts           # Entry point
│   ├── config/            # Configuration
│   │   ├── container.ts   # DI container
│   │   ├── env.ts         # Environment variables
│   │   └── ...
│   ├── database/          # Database
│   │   ├── connection.ts  # Drizzle connection
│   │   ├── schema.ts      # DB schemas
│   │   └── repositories/  # Repositories
│   ├── routes/            # API endpoints
│   │   ├── auth/          # Authentication
│   │   ├── chat/          # Chat/AI
│   │   ├── threads/       # Conversations
│   │   └── ...
│   ├── services/          # Business logic
│   │   ├── auth.ts        # Auth service
│   │   ├── llm-service.ts # AI service
│   │   └── ...
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
├── tests/                 # Tests
├── drizzle/               # DB migrations
├── package.json
└── tsconfig.json
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Environment Configuration
# Copy this file to .env.local and fill in your values

# Application Environment
NODE_ENV=development

# Database Configuration
DB_NAME=database_name

# Server Configuration
PORT=3000

# AI API Keys
CEREBRAS_API_KEY=your_cerebras_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application URLs
API_URL=your_API_URL_here
APP_NAME=your_app_name_here

# Frontend URL
FRONT_END_URL=your_frontend_url_here
```

### Database

Uses **SQLite** with **Drizzle ORM**:

```bash
# Generate migrations from schema
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema directly (development)
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

### Documentation
- **Swagger UI**: `/swagger`

## 🏗️ Architecture

### Dependency Injection
Uses **Awilix** for dependency injection:

```typescript

container.register({
  userRepository: asClass(UserRepository).singleton(),
  authService: asClass(AuthService).singleton(),
})


const authService = container.resolve<AuthService>('authService')
```

### Validation
**Zod** for type-safe validation:

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

app.post('/auth/login', ({ body }) => {
  const validated = loginSchema.parse(body)
  
})
```

### Services
Clear separation between layers:
- **Routes**: HTTP handling
- **Services**: Business logic
- **Repositories**: Data access
- **Utils**: Helper functions

## 🧪 Testing

```bash
# Run all tests
bun run test

# Tests in watch mode
bun run test:watch

# Tests with coverage
bun run test:coverage
```

### Test structure
```
tests/
├── helpers/             # Testing helpers
├── integration/         # Integration tests
├── repositories/        # Repository tests
└── services/           # Service tests
```

## 📜 Available Scripts

```bash
# Development
bun run dev           # Development server
bun run build         # Production build
bun run start         # Production server

# Database
bun run db:generate   # Generate migrations
bun run db:migrate    # Run migrations
bun run db:push       # Push schema
bun run db:studio     # Drizzle Studio

# Code quality
bun run lint          # Linting
bun run check         # Type checking
bun run format        # Formatting
```

## 🔒 Security

- **Rate Limiting**: Protection against abuse
- **Input Validation**: Zod for validation
- **Password Hashing**: bcrypt for passwords
- **CORS**: Configured for frontend
- **Helmet**: Security headers

## 📊 Monitoring

- **Logging**: ElysiaJS with Logestic
- **Health Check**: `/health` endpoint
- **Metrics**: System information

## 🚀 Deployment

### Production
```bash
bun run build
bun run start
```

### Docker (example)
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "dist/index.js"]
```

## 📦 Main Dependencies

- `elysia` - Web framework
- `drizzle-orm` - SQL ORM
- `openai` - OpenAI API
- `resend` - Email service
- `zod` - Validation
- `awilix` - DI container
- `bcrypt` - Password hashing

## 🤝 Development

### Conventions
- **Strict TypeScript**
- **ESLint + Biome** for quality
- **Tests** for all critical logic
- **Documentation** with Swagger

### Git Hooks
- Pre-commit: linting and tests
- Pre-push: build check

## 🔗 Related Links

- [ElysiaJS Docs](https://elysiajs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [OpenAI API](https://platform.openai.com/docs)
- [Resend](https://resend.com/docs)

---

Part of the [Hikki](../README.md) project