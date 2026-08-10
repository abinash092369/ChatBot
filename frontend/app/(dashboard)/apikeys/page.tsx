'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react';

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ['userApiKeys'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/apikeys');
      return res.data;
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<any>('/apikeys', { name: keyName });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['userApiKeys'] });
      if (data?.apiKey) {
        setGeneratedKey(data.apiKey);
      }
      setKeyName('');
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/apikeys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApiKeys'] });
    },
  });

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">Developer Platform</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">API Key Management</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Generate secure API keys to integrate the AI Engine into external applications with SHA-256 validation.
          </p>
        </div>
        <Key className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      {/* Newly Generated Key Banner */}
      {generatedKey && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>API Key Created - Copy it now! It won't be shown again.</span>
            <Button size="sm" onClick={handleCopy} className="bg-emerald-600 text-white">
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Key'}
            </Button>
          </div>
          <p className="font-mono text-sm break-all font-semibold select-all">{generatedKey}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create API Key */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Generate Secret Key</CardTitle>
            <CardDescription className="text-xs">Create new API credential</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Key Name</label>
              <Input placeholder="e.g. Production Backend Service" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
            </div>
            <Button
              onClick={() => createKeyMutation.mutate()}
              disabled={!keyName.trim() || createKeyMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-semibold"
            >
              {createKeyMutation.isPending ? <Spinner className="mr-2" /> : <Key className="h-4 w-4 mr-2" />}
              Generate API Key
            </Button>
          </CardContent>
        </Card>

        {/* Existing API Keys List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Active API Credentials</CardTitle>
            <CardDescription className="text-xs">Manage active integration tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="py-8 flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>
            ) : !keys?.length ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No active API keys created yet.</div>
            ) : (
              keys.map((k: any) => (
                <div key={k.id} className="p-4 rounded-xl border flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">{k.name}</h4>
                    <p className="font-mono text-xs text-muted-foreground">{k.keyPrefix}••••••••••••••••</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => revokeKeyMutation.mutate(k.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" /> Revoke
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
