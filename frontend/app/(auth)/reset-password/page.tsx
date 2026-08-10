'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/services/api.service';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setErrorMsg('Invalid or missing reset token.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);

      const response = await apiClient.post<any>('/auth/reset-password', {
        token,
        newPassword: values.newPassword,
      });

      if (response.success) {
        setSuccessMsg('Password has been reset successfully. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setErrorMsg(response.error?.message || 'Password reset failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Error processing request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl border-border/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium">New Password</label>
            <Input type="password" placeholder="••••••••" {...register('newPassword')} error={errors.newPassword?.message} />
          </div>

          <Button type="submit" className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" /> : 'Set New Password'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <Link href="/login" className="text-xs text-primary font-semibold hover:underline">
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
