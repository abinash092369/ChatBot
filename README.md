# ABHI AI - Phase 1 Foundation

Production-Grade ABHI AI Platform built with Next.js 15, React 19, Express, TypeScript, Prisma, PostgreSQL, and Redis.

## Phase 1 Capabilities

- **Architecture**: Decoupled architecture (`frontend/` Next.js 15 app and `backend/` Express TypeScript API).
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

- Frontend Web: [https://abhi-ai-platform-psi.vercel.app](https://abhi-ai-platform-psi.vercel.app)
- Backend API: [https://chatbot-m2lx.onrender.com/api/v1](https://chatbot-m2lx.onrender.com/api/v1)

### 4. Build Monorepo
```bash
npm run build
```
