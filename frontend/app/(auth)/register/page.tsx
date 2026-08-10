'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { apiClient } from '@/services/api.service';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const response = await apiClient.post<any>('/auth/register', values);

      if (response.success && response.data) {
        queryClient.clear();
        useChatStore.getState().resetChatStore();
        setAuth(response.data.user, response.data.accessToken);
        router.push('/dashboard');
      } else {
        setErrorMsg(response.error?.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl border-border/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">Start using ABHI AI today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">First name</label>
              <Input placeholder="John" {...register('firstName')} error={errors.firstName?.message} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Last name</label>
              <Input placeholder="Doe" {...register('lastName')} error={errors.lastName?.message} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Email address</label>
            <Input type="email" placeholder="name@example.com" {...register('email')} error={errors.email?.message} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Password</label>
            <Input type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
            <p className="text-[10px] text-muted-foreground">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
          </div>

          <Button type="submit" className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" /> : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
