'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const response = await apiClient.put<any>('/users/me', values);

      if (response.success && response.data) {
        setUser({ ...user!, ...response.data });
        setSuccessMsg('Profile updated successfully!');
      } else {
        setErrorMsg(response.error?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Error updating profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your personal details and view system account info</CardDescription>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">First name</label>
                <Input {...register('firstName')} error={errors.firstName?.message} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Last name</label>
                <Input {...register('lastName')} error={errors.lastName?.message} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Email address</label>
              <Input value={user.email} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
            </div>

            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {isLoading ? <Spinner className="mr-2" /> : 'Save Profile Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account Governance & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Assigned System Role</span>
            <Badge variant={user.role?.name === 'ADMIN' ? 'destructive' : 'secondary'}>{user.role?.name || 'USER'}</Badge>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email Verification Status</span>
            <Badge variant={user.isEmailVerified ? 'success' : 'outline'}>
              {user.isEmailVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Member Since</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
