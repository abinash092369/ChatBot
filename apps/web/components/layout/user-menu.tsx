'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/services/api.service';
import { User, Settings, LogOut, Shield } from 'lucide-react';
import { Badge } from '../ui/badge';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const navRouter = useRouter();

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || user.email[0]}`.toUpperCase();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      logout();
      navRouter.push('/login');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center border border-primary/30">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium leading-none">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card text-card-foreground shadow-xl z-50 p-2 space-y-1">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium">{user.email}</p>
              <div className="mt-1">
                <Badge variant={user.role?.name === 'ADMIN' ? 'destructive' : 'secondary'}>
                  {user.role?.name || 'USER'}
                </Badge>
              </div>
            </div>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>

            <Link
              href="/audit-logs"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Audit Logs</span>
            </Link>

            <div className="border-t border-border pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
