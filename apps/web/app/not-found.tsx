import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="h-20 w-20 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
          <FileQuestion className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="lg" className="bg-primary text-primary-foreground font-semibold">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
