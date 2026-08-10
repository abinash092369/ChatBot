import React from 'react';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative selection:bg-purple-500 selection:text-white">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/25">
              <Bot className="h-7 w-7" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">ABHI AI</h2>
          <p className="text-sm text-muted-foreground">Secure Enterprise Authentication</p>
        </div>

        {children}
      </div>
    </div>
  );
}
