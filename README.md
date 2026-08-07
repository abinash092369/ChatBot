# AI Assistant Platform - Phase 1 Foundation

Production-Grade AI Assistant Platform built with Next.js 15, React 19, Express, TypeScript, Prisma, PostgreSQL, and Redis.

## Phase 1 Capabilities

- **Monorepo Architecture**: Clean separation with `apps/` and `packages/`.
- **Authentication**: JWT access tokens, HttpOnly refresh token rotation, Google OAuth readiness, email verification, and password reset.
- **Role-Based Access Control (RBAC)**: Fine-grained user permissions and system roles (`ADMIN`, `USER`, `GUEST`).
- **Database & Prisma**: PostgreSQL schema featuring 12 core tables, indexed foreign keys, audit logs, and seeders.
- **Frontend Stack**: Next.js 15 App Router, React 19, Tailwind CSS, Framer Motion, TanStack Query, Zustand, React Hook Form, and Zod.
- **DevOps**: Docker, Docker Compose, Nginx Reverse Proxy, and GitHub Actions CI.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Run Seeder
```bash
npm run db:generate
```

### 3. Start Development Servers
```bash
npm run dev
```

- Frontend Web: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

### 4. Build Monorepo
```bash
npm run build
```
