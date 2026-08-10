'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Building2, UserPlus, Shield, Users, Mail } from 'lucide-react';

export default function OrgSettingsPage() {
  const queryClient = useQueryClient();
  const [orgName, setOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['userOrganizations'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/organizations');
      return res.data;
    },
  });

  const activeOrg = orgs?.[0];

  const { data: members } = useQuery({
    queryKey: ['orgMembers', activeOrg?.id],
    queryFn: async () => {
      if (!activeOrg?.id) return [];
      const res = await apiClient.get<any[]>(`/organizations/${activeOrg.id}/members`);
      return res.data;
    },
    enabled: !!activeOrg?.id,
  });

  const createOrgMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/organizations', { name: orgName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrganizations'] });
      setOrgName('');
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async () => {
      if (!activeOrg?.id) return;
      await apiClient.post(`/organizations/${activeOrg.id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
    },
    onSuccess: () => {
      setInviteEmail('');
    },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">Multi-Tenancy Engine</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Organization & Team Management</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Manage multi-tenant workspaces, team members, invitations, and enterprise RBAC roles.
          </p>
        </div>
        <Building2 className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Organization */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Create Organization</CardTitle>
            <CardDescription className="text-xs">Establish a new enterprise workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Organization Name</label>
              <Input placeholder="e.g. Acme Corp AI" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <Button
              onClick={() => createOrgMutation.mutate()}
              disabled={!orgName.trim() || createOrgMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-semibold"
            >
              {createOrgMutation.isPending ? <Spinner className="mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
              Create Org
            </Button>
          </CardContent>
        </Card>

        {/* Members & Invite */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Team Members & Access</CardTitle>
            <CardDescription className="text-xs">
              {activeOrg ? `Active Organization: ${activeOrg.name}` : 'No Organization Selected'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invite Form */}
            <div className="p-4 rounded-xl border bg-accent/40 space-y-3">
              <h4 className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">Invite Team Member</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="bg-background border text-xs font-semibold px-3 py-2 rounded-xl"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button
                  onClick={() => inviteMemberMutation.mutate()}
                  disabled={!inviteEmail.trim() || inviteMemberMutation.isPending}
                  className="bg-primary text-primary-foreground font-semibold shrink-0"
                >
                  {inviteMemberMutation.isPending ? <Spinner /> : <UserPlus className="h-4 w-4 mr-1" />}
                  Invite
                </Button>
              </div>
            </div>

            {/* Member List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Current Organization Members</h4>
              {members?.map((m: any) => (
                <div key={m.id} className="p-3 rounded-xl border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-600 font-bold flex items-center justify-center">
                      {m.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{m.user?.email}</p>
                      <p className="text-muted-foreground text-[10px]">Joined {new Date(m.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">{m.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
