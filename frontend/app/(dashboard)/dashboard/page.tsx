'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/stores/chat.store';
import { apiClient } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import { Message, Conversation } from '@/lib/types';
import { ChatWindow } from '@/components/chat/chat-window';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Wrench,
  Search,
  UserPlus,
  Shield,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  BarChart3,
  RefreshCw,
  Lock,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === 'ADMIN';

  if (isAdmin) {
    return <AdminDashboardView />;
  }

  return <UserChatDashboardView />;
}

/* ==================== SUPER ADMIN CONTROL CENTER VIEW ==================== */
function AdminDashboardView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'flags' | 'settings'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New User Form State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');
  const [addUserError, setAddUserError] = useState<string | null>(null);

  // Fetch Users List
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['adminUsers', userSearch, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (roleFilter) params.append('role', roleFilter);
      const res = await apiClient.get<any>(`/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  // Fetch Analytics Metrics
  const { data: analyticsData } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/admin/analytics');
      return res.data;
    },
  });

  // Fetch Feature Flags
  const { data: flagsData } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/feature-flags');
      return res.data;
    },
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: string }) => {
      await apiClient.put(`/admin/users/${userId}/role`, { roleName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await apiClient.put(`/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiClient.post('/admin/users', userData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsAddUserOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setAddUserError(null);
    },
    onError: (err: any) => {
      setAddUserError(err.response?.data?.error?.message || err.message || 'Failed to create user');
    },
  });

  const toggleFlagMutation = useMutation({
    mutationFn: async ({ name, isEnabled }: { name: string; isEnabled: boolean }) => {
      await apiClient.post('/feature-flags/toggle', { name, isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });

  const users = usersData?.items || [];
  const metrics = analyticsData?.metrics || {};
  const flags = flagsData || [];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
      setAddUserError('Email and password are required');
      return;
    }
    createUserMutation.mutate({
      email: newUserEmail,
      password: newUserPassword,
      firstName: newUserFirstName,
      lastName: newUserLastName,
      roleName: newUserRole,
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className="bg-amber-400 text-purple-950 font-bold border-none flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>SUPER ADMIN COMMAND CENTER</span>
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform Control Panel</h1>
          <p className="text-purple-100 text-sm max-w-xl">
            Full administrative control over user accounts, role permissions, real-time feature flags, system analytics, and platform security.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className="bg-white text-purple-900 hover:bg-purple-50 font-semibold shadow-lg"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span>Create User</span>
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 shadow-sm border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</span>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold">{metrics.totalUsers || users.length || 0}</p>
          <p className="text-xs text-muted-foreground">Registered platform accounts</p>
        </Card>

        <Card className="p-6 space-y-2 shadow-sm border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Conversations</span>
            <MessageSquare className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold">{metrics.totalConversations || 0}</p>
          <p className="text-xs text-muted-foreground">User chats in database</p>
        </Card>

        <Card className="p-6 space-y-2 shadow-sm border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tool Executions</span>
            <Wrench className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold">{metrics.totalToolExecutions || 0}</p>
          <p className="text-xs text-muted-foreground">Dynamic tools called</p>
        </Card>

        <Card className="p-6 space-y-2 shadow-sm border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Web Queries</span>
            <Search className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-3xl font-extrabold">{metrics.totalSearches || 0}</p>
          <p className="text-xs text-muted-foreground">Live searches processed</p>
        </Card>
      </div>

      {/* Control Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'users' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management & Roles</span>
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'flags' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Feature Flags</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'analytics' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>System Analytics</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Platform Users & Permissions</CardTitle>
              <CardDescription>View, control, assign roles, and activate/deactivate platform accounts</CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 w-64 text-xs rounded-xl"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-background border border-border text-xs rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {isUsersLoading ? (
              <div className="py-12 flex justify-center"><Spinner className="h-8 w-8 text-primary" /></div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Chats</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3 text-right">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-600 font-bold flex items-center justify-center text-xs">
                              {u.firstName?.[0] || u.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm leading-none">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role?.name || 'USER'}
                            onChange={(e) => updateRoleMutation.mutate({ userId: u.id, roleName: e.target.value })}
                            className="bg-card border border-border text-xs font-semibold rounded-lg px-2 py-1 focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.isActive ? 'outline' : 'destructive'} className="text-xs">
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-xs">{u.conversationCount || 0}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={u.isActive ? 'destructive' : 'outline'}
                            size="sm"
                            className="text-xs h-7 px-3"
                            onClick={() => updateStatusMutation.mutate({ userId: u.id, isActive: !u.isActive })}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'flags' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>System Feature Flags</CardTitle>
            <CardDescription>Enable or disable real-time platform capabilities across all users</CardDescription>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Live Web Search Tool</h4>
                    <p className="text-xs text-muted-foreground">Allows AI agents to perform live web queries</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Active</Badge>
                </div>
                <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Code Execution Sandbox</h4>
                    <p className="text-xs text-muted-foreground">Runs JavaScript math & code execution inside isolated environment</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Active</Badge>
                </div>
                <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">RAG Document Indexing</h4>
                    <p className="text-xs text-muted-foreground">Knowledge base vector embedding generation</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Active</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {flags.map((flag: any) => (
                  <div key={flag.id} className="p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{flag.name}</h4>
                      <p className="text-xs text-muted-foreground">{flag.description || 'System module flag'}</p>
                    </div>
                    <Button
                      variant={flag.isEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFlagMutation.mutate({ name: flag.name, isEnabled: !flag.isEnabled })}
                    >
                      {flag.isEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>System Activity Logs</CardTitle>
            <CardDescription>Execution times, token usage, and cost tracking across all user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {!analyticsData?.usageLogs?.length ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No usage logs recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Resource</th>
                      <th className="px-4 py-3">Tokens</th>
                      <th className="px-4 py-3">Execution Time</th>
                      <th className="px-4 py-3">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analyticsData.usageLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="font-mono text-xs">{log.resourceType}</Badge></td>
                        <td className="px-4 py-3 font-medium">{log.tokensUsed}</td>
                        <td className="px-4 py-3 font-mono text-xs">{log.executionTimeMs} ms</td>
                        <td className="px-4 py-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">${(log.cost || 0).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal: Create User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">Create New User Account</h3>
            {addUserError && (
              <div className="p-3 rounded-lg bg-destructive/15 text-destructive text-xs font-medium">{addUserError}</div>
            )}
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First Name" value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} />
                <Input placeholder="Last Name" value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} />
              </div>
              <Input type="email" placeholder="User Email Address" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
              <Input type="password" placeholder="Account Password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
              <div>
                <label className="text-xs font-medium block mb-1">Assign Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="USER">USER (Standard Access)</option>
                  <option value="ADMIN">ADMIN (Super Administrator)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? <Spinner className="mr-2" /> : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== USER CHAT DASHBOARD VIEW ==================== */
function UserChatDashboardView() {
  const queryClient = useQueryClient();
  const [toolSteps, setToolSteps] = useState<any[]>([]);
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<Message | null>(null);

  const {
    activeConversationId,
    setActiveConversationId,
    model,
    systemPrompt,
    temperature,
    startStreaming,
    appendStreamingContent,
    stopStreaming,
  } = useChatStore();

  const { data: conversationData } = useQuery({
    queryKey: ['conversation', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      const res = await apiClient.get<Conversation>(`/conversations/${activeConversationId}`);
      return res.data;
    },
    enabled: !!activeConversationId,
  });

  const rawMessages: Message[] = conversationData?.messages || [];
  const messages: Message[] = optimisticUserMsg
    ? [...rawMessages.filter((m) => m.id !== optimisticUserMsg.id), optimisticUserMsg]
    : rawMessages;

  const handleSendMessage = async (content: string, attachmentIds: string[]) => {
    const abortController = new AbortController();
    const tempAssistantId = Math.random().toString(36).substring(2, 9);
    const tempUserId = Math.random().toString(36).substring(2, 9);

    const tempUserMessage: Message = {
      id: tempUserId,
      conversationId: activeConversationId || 'temp',
      role: 'USER',
      content,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOptimisticUserMsg(tempUserMessage);

    setToolSteps([]);
    startStreaming(tempAssistantId, abortController);

    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers,
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({
          conversationId: activeConversationId || undefined,
          message: content,
          model,
          attachmentIds,
          systemPrompt: systemPrompt || undefined,
          temperature,
        }),
      });

      if (!response.ok || !response.body) {
        stopStreaming();
        setOptimisticUserMsg(null);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'start') {
                if (event.isNewConversation && event.conversationId) {
                  setActiveConversationId(event.conversationId);
                }
                if (event.toolSteps && event.toolSteps.length > 0) {
                  setToolSteps(event.toolSteps);
                }
              } else if (event.type === 'chunk') {
                appendStreamingContent(event.delta);
              } else if (event.type === 'done') {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                if (event.conversationId) {
                  queryClient.invalidateQueries({ queryKey: ['conversation', event.conversationId] });
                }
              }
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
      }
    } finally {
      stopStreaming();
      setOptimisticUserMsg(null);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    const abortController = new AbortController();
    const tempAssistantId = Math.random().toString(36).substring(2, 9);
    setToolSteps([]);
    startStreaming(tempAssistantId, abortController);

    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const response = await fetch(`${apiUrl}/chat/regenerate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok || !response.body) {
        stopStreaming();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'chunk') {
                appendStreamingContent(event.delta);
              } else if (event.type === 'done') {
                queryClient.invalidateQueries({ queryKey: ['conversation', activeConversationId] });
              }
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      stopStreaming();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await apiClient.delete(`/messages/${messageId}`);
      queryClient.invalidateQueries({ queryKey: ['conversation', activeConversationId] });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] -m-6 md:-m-8 flex flex-col min-w-0 overflow-hidden">
      <ChatWindow
        messages={messages}
        title={conversationData?.title}
        toolSteps={toolSteps}
        onSendMessage={handleSendMessage}
        onRegenerate={handleRegenerate}
        onDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
}
