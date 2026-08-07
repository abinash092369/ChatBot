'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

export default function AuditLogsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/audit-logs');
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Audit Logs</CardTitle>
          <CardDescription>Chronological record of system security events and user authentications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-destructive/15 text-destructive text-sm font-medium">
              Failed to load security audit logs.
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No audit logs recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/30">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((log: any) => (
                    <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{log.entity}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{log.user?.email || log.userId || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
