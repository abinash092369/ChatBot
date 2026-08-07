'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="h-20 w-20 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">{error.message || 'An unexpected application error occurred.'}</p>
        </div>
        <Button size="lg" onClick={() => reset()} className="bg-primary text-primary-foreground font-semibold">
          Try Again
        </Button>
      </div>
    </div>
  );
}
