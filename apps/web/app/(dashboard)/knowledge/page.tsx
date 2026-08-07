'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Database, Plus, Upload, Search, FileText, CheckCircle } from 'lucide-react';

export default function KnowledgePage() {
  const queryClient = useQueryClient();
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch Knowledge Bases
  const { data: bases, isLoading } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/rag/bases');
      return res.data;
    },
  });

  // Create Knowledge Base Mutation
  const createBaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/rag/bases', { name, description });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
      setName('');
      setDescription('');
    },
  });

  // Upload Document Mutation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, baseId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('knowledgeBaseId', baseId);

    try {
      await apiClient.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    } catch {
      // Ignore
    }
  };

  // Search Vector Store
  const handleVectorSearch = async () => {
    if (!selectedBaseId || !searchQuery.trim()) return;
    const res = await apiClient.post<any[]>('/rag/search', {
      knowledgeBaseId: selectedBaseId,
      query: searchQuery,
    });
    setSearchResults(res.data || []);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">RAG Vector Engine</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Knowledge Base Libraries</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Upload PDFs, DOCX, CSV, TXT, and Markdown documents to build vector embeddings for semantic context retrieval.
          </p>
        </div>
        <Database className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Knowledge Base */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">New Knowledge Base</CardTitle>
            <CardDescription className="text-xs">Create a document repository</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Name</label>
              <Input placeholder="e.g. Legal Documents" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <Input placeholder="Optional description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button
              onClick={() => createBaseMutation.mutate()}
              disabled={!name.trim() || createBaseMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-semibold"
            >
              {createBaseMutation.isPending ? <Spinner className="mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Library
            </Button>
          </CardContent>
        </Card>

        {/* Knowledge Bases List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Knowledge Repositories</CardTitle>
            <CardDescription className="text-xs">Select a repository to upload files or test semantic vector search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="py-8 flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>
            ) : !bases?.length ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No knowledge bases created yet.</div>
            ) : (
              <div className="space-y-3">
                {bases.map((kb: any) => (
                  <div
                    key={kb.id}
                    onClick={() => setSelectedBaseId(kb.id)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedBaseId === kb.id ? 'border-primary bg-primary/10' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-purple-500" />
                      <div>
                        <p className="font-bold text-sm">{kb.name}</p>
                        <p className="text-xs text-muted-foreground">{kb.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{kb._count?.documents || 0} Docs</Badge>
                      <label className="p-2 rounded-lg bg-primary text-primary-foreground cursor-pointer text-xs font-semibold hover:bg-primary/90">
                        <Upload className="h-3.5 w-3.5 inline mr-1" /> Upload
                        <input type="file" onChange={(e) => handleFileUpload(e, kb.id)} className="hidden" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vector Semantic Search Tester */}
      {selectedBaseId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Semantic Vector Search Tester</CardTitle>
            <CardDescription className="text-xs">Test hybrid vector search retrieval and cosine similarity ranking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type semantic query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVectorSearch()}
              />
              <Button onClick={handleVectorSearch} className="bg-primary text-primary-foreground font-semibold">
                <Search className="h-4 w-4 mr-2" /> Search Vectors
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">Relevant Document Context Chunks</h4>
                {searchResults.map((res, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-card/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">Source: {res.documentName}</span>
                      <Badge variant="success">Similarity Score: {(res.score * 100).toFixed(1)}%</Badge>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">{res.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
