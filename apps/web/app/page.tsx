'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Shield, Zap, Lock, Database, ArrowRight, Bot, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
            AI Assistant Platform
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 max-w-6xl mx-auto text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl -ml-20" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Phase 1 Enterprise Foundation</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
              Enterprise-Grade Platform Architecture Built for <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Scale & Security</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Production-ready SaaS boilerplate featuring Clean Architecture, JWT refresh token rotation, Prisma PostgreSQL database, Redis caching, RBAC, and responsive Next.js 15 UI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-500/30">
                  <span>Explore Dashboard</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  Sign In to Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 py-16 bg-muted/40 border-t border-border">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Built with Production SaaS Standards</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every component, security rule, and API model is crafted for high availability, zero placeholders, and strict maintainability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Secure Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  JWT access tokens, HttpOnly refresh token cookies with family reuse detection, bcrypt password hashing, and Google OAuth setup.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Prisma PostgreSQL</h3>
                <p className="text-sm text-muted-foreground">
                  12 core database tables with proper indexing, cascading deletes, RBAC permissions, audit logs, and user preference tracking.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Full Stack Clean Arch</h3>
                <p className="text-sm text-muted-foreground">
                  Decoupled layers in Express backend (Controllers, Services, Repositories) and Next.js 15 App Router with Zustand & TanStack Query.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 AI Assistant Platform - Phase 1 Foundation. Built for production excellence.</p>
      </footer>
    </div>
  );
}
