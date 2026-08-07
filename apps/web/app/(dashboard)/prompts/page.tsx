'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { BookOpen, Plus, Copy, Check, Sparkles } from 'lucide-react';

export default function PromptsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['promptTemplates'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/prompts');
      return res.data;
    },
  });

  const createPromptMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/prompts', { title, content, category, isPublic: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptTemplates'] });
      setTitle('');
      setContent('');
    },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">Prompt Marketplace</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Prompt Library & Templates</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Save reusable system prompt instructions, share templates with your team, and discover curated prompts.
          </p>
        </div>
        <BookOpen className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Prompt */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">New Prompt Template</CardTitle>
            <CardDescription className="text-xs">Save to team library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Title</label>
              <Input placeholder="e.g. Senior Code Reviewer" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Category</label>
              <Input placeholder="Engineering, Marketing, Legal..." value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">System Instructions</label>
              <textarea
                rows={4}
                placeholder="You are an expert software reviewer..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 rounded-xl border bg-background text-xs focus:outline-none"
              />
            </div>
            <Button
              onClick={() => createPromptMutation.mutate()}
              disabled={!title.trim() || !content.trim() || createPromptMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-semibold"
            >
              {createPromptMutation.isPending ? <Spinner className="mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Save Template
            </Button>
          </CardContent>
        </Card>

        {/* Prompt Templates List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Library & Templates</CardTitle>
            <CardDescription className="text-xs">Curated system prompt presets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="py-8 flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>
            ) : !prompts?.length ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">Full Stack TypeScript Architect</h4>
                    <Badge variant="outline">Engineering</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    "You are a Senior Full Stack Engineer specializing in Next.js 15, Node.js, Express, and Clean Architecture..."
                  </p>
                </div>
              </div>
            ) : (
              prompts.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl border space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">{p.title}</h4>
                    <Badge variant="outline">{p.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{p.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
