'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { BarChart3, Users, MessageSquare, Wrench, Search, Database, BookOpen, GitBranch, ShieldCheck, UserCheck } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === 'ADMIN';

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', isAdmin ? 'admin' : 'user'],
    queryFn: async () => {
      const endpoint = isAdmin ? '/admin/analytics' : '/users/analytics';
      const res = await apiClient.get<any>(endpoint);
      return res.data;
    },
  });

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Dynamic Role Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className="bg-white/20 text-white border-none flex items-center space-x-1">
              {isAdmin ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                  <span>Admin System Intelligence</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-purple-200" />
                  <span>Personal Workspace Analytics</span>
                </>
              )}
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {isAdmin ? 'System & Admin Analytics' : 'My Activity & Usage Metrics'}
          </h2>
          <p className="text-purple-100 text-sm max-w-xl">
            {isAdmin
              ? 'Monitor platform users, real-time tool executions, database conversations, web search queries, and global usage logs.'
              : 'Track your personal active conversations, tool executions, uploaded knowledge documents, saved prompt templates, and token usage.'}
          </p>
        </div>
        <BarChart3 className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-destructive/15 text-destructive text-sm font-medium">
          Failed to load analytics metrics. Please check your network or try logging in again.
        </div>
      ) : isAdmin ? (
        /* ==================== ADMIN DASHBOARD VIEW ==================== */
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 space-y-3 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalUsers || 0}</p>
              <p className="text-xs text-muted-foreground">Registered platform users</p>
            </Card>

            <Card className="p-6 space-y-3 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Active Chats</span>
                <MessageSquare className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalConversations || 0}</p>
              <p className="text-xs text-muted-foreground">Conversations across system</p>
            </Card>

            <Card className="p-6 space-y-3 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tool Executions</span>
                <Wrench className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalToolExecutions || 0}</p>
              <p className="text-xs text-muted-foreground">Total dynamic tools called</p>
            </Card>

            <Card className="p-6 space-y-3 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Web Searches</span>
                <Search className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalSearches || 0}</p>
              <p className="text-xs text-muted-foreground">Global web queries executed</p>
            </Card>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Global System Resource Usage</CardTitle>
              <CardDescription>Execution times, token consumption, and cost tracking across all accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {!data?.usageLogs?.length ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No usage logs recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/30">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Resource Type</th>
                        <th className="px-4 py-3">Tokens Used</th>
                        <th className="px-4 py-3">Execution Time</th>
                        <th className="px-4 py-3">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.usageLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.resourceType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium">{log.tokensUsed}</td>
                          <td className="px-4 py-3 font-mono text-xs">{log.executionTimeMs} ms</td>
                          <td className="px-4 py-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                            ${(log.cost || 0).toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* ==================== USER DASHBOARD VIEW ==================== */
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="p-5 space-y-2 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">My Chats</span>
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{metrics.totalConversations || 0}</p>
              <p className="text-[11px] text-muted-foreground">Active conversations</p>
            </Card>

            <Card className="p-5 space-y-2 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Tool Calls</span>
                <Wrench className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold">{metrics.totalToolExecutions || 0}</p>
              <p className="text-[11px] text-muted-foreground">Executions triggered</p>
            </Card>

            <Card className="p-5 space-y-2 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Knowledge Bases</span>
                <Database className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{metrics.totalKnowledgeBases || 0}</p>
              <p className="text-[11px] text-muted-foreground">RAG vector stores</p>
            </Card>

            <Card className="p-5 space-y-2 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Saved Prompts</span>
                <BookOpen className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-2xl font-bold">{metrics.totalPrompts || 0}</p>
              <p className="text-[11px] text-muted-foreground">Prompt templates</p>
            </Card>

            <Card className="p-5 space-y-2 shadow-sm hover:shadow-md transition-all border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Workflows</span>
                <GitBranch className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{metrics.totalWorkflows || 0}</p>
              <p className="text-[11px] text-muted-foreground">Automated workflows</p>
            </Card>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>My Personal Resource Usage</CardTitle>
              <CardDescription>Your recent token consumption, execution times, and activity history</CardDescription>
            </CardHeader>
            <CardContent>
              {!data?.usageLogs?.length ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No personal activity recorded yet. Start a new chat or run tools to track usage!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/30">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Resource Type</th>
                        <th className="px-4 py-3">Tokens Used</th>
                        <th className="px-4 py-3">Execution Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.usageLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.resourceType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium">{log.tokensUsed}</td>
                          <td className="px-4 py-3 font-mono text-xs">{log.executionTimeMs} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
