'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/profile': 'User Profile',
  '/settings': 'Application Settings',
  '/audit-logs': 'Security Audit Logs',
};

export function Navbar() {
  const pathname = usePathname();
  const title = titleMap[pathname] || 'ABHI AI';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
