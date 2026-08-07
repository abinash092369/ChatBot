'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { BarChart3, Users, MessageSquare, Wrench, Search, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/admin/analytics');
      return res.data;
    },
  });

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">System Intelligence</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin & Tool Analytics</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Monitor real-time tool executions, RAG vector usage, web search queries, and user metrics.
          </p>
        </div>
        <BarChart3 className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner className="h-8 w-8 text-primary" /></div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-destructive/15 text-destructive text-sm font-medium">Failed to load analytics dashboard.</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalUsers || 0}</p>
              <p className="text-xs text-muted-foreground">Registered platform users</p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Active Chats</span>
                <MessageSquare className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalConversations || 0}</p>
              <p className="text-xs text-muted-foreground">Conversations in database</p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tool Executions</span>
                <Wrench className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalToolExecutions || 0}</p>
              <p className="text-xs text-muted-foreground">Dynamic tools called</p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Web Searches</span>
                <Search className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-3xl font-bold">{metrics.totalSearches || 0}</p>
              <p className="text-xs text-muted-foreground">Live web queries</p>
            </Card>
          </div>

          {/* Usage Activity Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Resource Usage Activity</CardTitle>
              <CardDescription>Execution times, token consumption, and cost tracking</CardDescription>
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
                          <td className="px-4 py-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">${log.cost.toFixed(4)}</td>
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
