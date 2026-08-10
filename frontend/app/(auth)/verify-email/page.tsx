'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/services/api.service';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token in URL.');
      return;
    }

    async function verify() {
      try {
        const response = await apiClient.post<any>('/auth/verify-email', { token });
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(response.error?.message || 'Email verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || err.message || 'Error processing verification.');
      }
    }

    verify();
  }, [token]);

  return (
    <Card className="shadow-2xl border-border/60 backdrop-blur-sm text-center">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Email Verification</CardTitle>
        <CardDescription>Verifying your account security token</CardDescription>
      </CardHeader>
      <CardContent className="py-6 flex flex-col items-center justify-center space-y-4">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-3">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-sm text-muted-foreground">Validating token with server...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
              <XCircle className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-destructive">{message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <Link href="/login" className="text-xs text-primary font-semibold hover:underline">
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
