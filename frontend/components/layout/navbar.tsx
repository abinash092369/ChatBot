'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { Menu } from 'lucide-react';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/profile': 'User Profile',
  '/settings': 'Application Settings',
  '/audit-logs': 'Security Audit Logs',
  '/analytics': 'System & User Intelligence',
  '/knowledge': 'Knowledge Base (RAG)',
  '/tools': 'Tools Gallery',
  '/prompts': 'Prompt Library',
  '/workflows': 'Workflows',
  '/billing': 'Billing & Subscriptions',
  '/apikeys': 'API Keys',
  '/org/settings': 'Org & Team Settings',
};

export function Navbar({ onMobileMenuClick }: { onMobileMenuClick?: () => void }) {
  const pathname = usePathname();
  const title = titleMap[pathname] || 'ABHI AI';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
        {onMobileMenuClick && (
          <button
            onClick={onMobileMenuClick}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base md:text-xl font-bold tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
        <ThemeToggle />
        <div className="h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
