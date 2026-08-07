'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { GitBranch, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WorkflowsPage() {
  const [runningId, setRunningId] = useState<string | null>(null);
  const [taskResult, setTaskResult] = useState<any | null>(null);

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/workflows');
      return res.data;
    },
  });

  const handleRunWorkflow = async (id: string) => {
    try {
      setRunningId(id);
      setTaskResult(null);
      const res = await apiClient.post(`/workflows/${id}/execute`, {
        input: { target: 'PDF Report Generation', date: new Date().toISOString() },
      });
      setTaskResult(res.data);
    } catch {
      // Ignore
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">Multi-Step Automation</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Agent Workflow Pipelines</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Automate multi-step tasks: Document Parsing ➔ Web Search ➔ AI Summary ➔ PDF Export.
          </p>
        </div>
        <GitBranch className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
          <CardDescription>Launch automated multi-step agent tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="py-8 flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>
          ) : !workflows?.length ? (
            <div className="p-4 rounded-xl border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Automated Document Summarizer & Export</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Parse PDF ➔ Search References ➔ Generate Executive Report</p>
                </div>
                <Button onClick={() => handleRunWorkflow('default')} disabled={runningId === 'default'} className="bg-primary text-primary-foreground font-semibold">
                  {runningId === 'default' ? <Spinner className="mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Execute Pipeline
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400 font-mono">
                <span>PDF Extraction</span> <ArrowRight className="h-3 w-3" /> <span>Web Enrichment</span> <ArrowRight className="h-3 w-3" /> <span>AI Synthesis</span>
              </div>
            </div>
          ) : (
            workflows.map((wf: any) => (
              <div key={wf.id} className="p-4 rounded-xl border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{wf.name}</h3>
                  <p className="text-xs text-muted-foreground">{wf.description}</p>
                </div>
                <Button onClick={() => handleRunWorkflow(wf.id)} disabled={runningId === wf.id} className="bg-primary text-primary-foreground font-semibold">
                  {runningId === wf.id ? <Spinner className="mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Execute Workflow
                </Button>
              </div>
            ))
          )}

          {taskResult && (
            <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-xs space-y-2 mt-4">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Workflow Task Launched Successfully</span>
              </div>
              <pre className="font-mono text-muted-foreground">{JSON.stringify(taskResult, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
