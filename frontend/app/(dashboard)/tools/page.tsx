'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Wrench, Play, Code, CheckCircle, Terminal } from 'lucide-react';

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [toolInput, setToolInput] = useState('');
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: tools, isLoading } = useQuery({
    queryKey: ['toolsList'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/tools');
      return res.data;
    },
  });

  const handleTestTool = async () => {
    if (!selectedTool) return;
    try {
      setIsExecuting(true);
      setExecutionResult(null);
      let parsedInput = {};
      try {
        parsedInput = toolInput ? JSON.parse(toolInput) : {};
      } catch {
        parsedInput = { query: toolInput, expression: toolInput, code: toolInput };
      }

      const res = await apiClient.post('/tools/execute', {
        toolName: selectedTool.name,
        input: parsedInput,
      });
      setExecutionResult(res.data);
    } catch (err: any) {
      setExecutionResult({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">Agent Tool Ecosystem</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Registered AI Tools & Plugins</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Inspect discovered tool JSON schemas and test execution directly with inputs.
          </p>
        </div>
        <Wrench className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tool Cards */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Discovered Tools</CardTitle>
            <CardDescription className="text-xs">Dynamic Tool Registry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="py-8 flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>
            ) : (
              tools?.map((t: any) => (
                <div
                  key={t.name}
                  onClick={() => {
                    setSelectedTool(t);
                    setToolInput(t.name === 'calculator' ? '{"expression": "150 * 0.18"}' : '{"query": "Latest AI news"}');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTool?.name === t.name ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-mono">{t.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Interactive Tool Tester */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tool Execution Sandbox</CardTitle>
            <CardDescription className="text-xs">
              {selectedTool ? `Testing '${selectedTool.name}'` : 'Select a tool from the list to test'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTool ? (
              <>
                <div className="p-3 rounded-lg bg-accent/50 text-xs space-y-1">
                  <p className="font-semibold text-purple-600 dark:text-purple-400">Schema Description</p>
                  <p className="text-muted-foreground">{selectedTool.description}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Input JSON Payload</label>
                  <textarea
                    rows={4}
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-slate-950 font-mono text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <Button onClick={handleTestTool} disabled={isExecuting} className="bg-primary text-primary-foreground font-semibold">
                  {isExecuting ? <Spinner className="mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Execute Tool
                </Button>

                {executionResult && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase">Execution Output Result</h4>
                    <pre className="p-4 rounded-xl border bg-card/60 text-xs font-mono overflow-x-auto">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">Please select a tool to test.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
