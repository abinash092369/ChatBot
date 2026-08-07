'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/services/api.service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const response = await apiClient.post<any>('/auth/forgot-password', values);

      if (response.success) {
        setSuccessMsg(response.message || 'Password reset link sent to your email address.');
      } else {
        setErrorMsg(response.error?.message || 'Failed to send password reset request.');
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
        <CardTitle className="text-xl font-bold text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center">Enter your email to receive password reset instructions</CardDescription>
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
            <label className="text-xs font-medium">Email address</label>
            <Input type="email" placeholder="name@example.com" {...register('email')} error={errors.email?.message} />
          </div>

          <Button type="submit" className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" /> : 'Send Reset Link'}
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
