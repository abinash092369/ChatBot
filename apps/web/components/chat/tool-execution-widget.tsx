'use client';

import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

export function ToolExecutionWidget({ steps }: { steps: Array<{ toolName: string; input: any; output?: any; error?: string }> }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-xs overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />
          <span>Executed {steps.length} Tool Step{steps.length > 1 ? 's' : ''} ({steps.map((s) => s.toolName).join(', ')})</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-purple-500/20 space-y-3 bg-background/50">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-1.5 p-2 rounded-lg bg-card border text-[11px]">
              <div className="flex items-center justify-between font-mono font-semibold text-purple-600 dark:text-purple-400">
                <span>Tool: {step.toolName}</span>
                {step.error ? (
                  <span className="flex items-center text-destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</span>
                ) : (
                  <span className="flex items-center text-emerald-500"><CheckCircle className="h-3 w-3 mr-1" /> Success</span>
                )}
              </div>
              <div className="font-mono text-muted-foreground">
                <p>Input: {JSON.stringify(step.input)}</p>
                {step.output && <p className="mt-1 text-foreground">Result: {JSON.stringify(step.output).substring(0, 150)}...</p>}
                {step.error && <p className="mt-1 text-destructive">Error: {step.error}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
