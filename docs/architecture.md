# Phase 1 Architecture Documentation

## Architecture Overview

The AI Assistant Platform is built as a production-grade monorepo using npm workspaces.

```
chatbot/
├── apps/
│   ├── web/        # Next.js 15 App Router + React 19 + Tailwind CSS + Zustand
│   └── server/     # Node.js + Express + TypeScript Clean Architecture
├── packages/
│   ├── types/      # Shared TypeScript interfaces & Enums
│   ├── config/     # Base tsconfigs, ESLint & Prettier configs
│   ├── utils/      # Shared helper utilities & formatters
│   └── api-client/ # Type-safe Axios client with refresh token interceptor
├── prisma/         # PostgreSQL schema (12 models) & seed script
├── docker/         # Production Dockerfiles (web & server)
├── nginx/          # Nginx reverse proxy configuration
├── docs/           # System documentation
└── .github/        # GitHub Actions CI workflows
```

## Security Design

1. **Authentication Flow**:
   - Access Tokens: Short-lived JWT (15 minutes).
   - Refresh Tokens: Long-lived HttpOnly Secure Lax SameSite cookie (7 days).
   - Token Rotation: Every refresh request invalidates the old token and issues a new pair within the same token family.
   - Reuse Detection: If an old/rotated refresh token is presented, the system detects a breach, revokes the entire family, and invalidates all active sessions for the user.

2. **Database Models (Prisma)**:
   - `User`, `Role`, `Permission`, `RolePermission` (RBAC system)
   - `Session`, `RefreshToken`, `OAuthAccount`
   - `VerificationToken`, `PasswordResetToken`
   - `Settings`, `UserPreferences`, `AuditLog`

3. **API Standards**:
   - Structured JSON response envelope: `{ success, message, data, error, timestamp }`.
   - Zod schema validation middleware.
   - Global Error Handler mapping exceptions to HTTP status codes.
