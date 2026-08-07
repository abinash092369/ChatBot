import React from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Spinner className="h-10 w-10 text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Loading page resources...</p>
    </div>
  );
}
