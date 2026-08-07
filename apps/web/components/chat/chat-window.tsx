'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Message } from '@chatbot/types';
import { MessageItem } from './message-item';
import { Composer } from './composer';
import { ToolExecutionWidget } from './tool-execution-widget';
import { useChatStore } from '@/stores/chat.store';
import { Bot, ChevronDown, Sparkles, ArrowDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';

export function ChatWindow({
  messages,
  title,
  toolSteps = [],
  onSendMessage,
  onRegenerate,
  onDeleteMessage,
}: {
  messages: Message[];
  title?: string;
  toolSteps?: Array<{ toolName: string; input: any; output?: any; error?: string }>;
  onSendMessage: (message: string, attachmentIds: string[]) => void;
  onRegenerate?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    model,
    setModel,
    systemPrompt,
    setSystemPrompt,
    isStreaming,
    streamingContent,
    streamingMessageId,
  } = useChatStore();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, toolSteps]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0 relative">
      {/* Top Bar Header */}
      <div className="h-16 border-b border-border/60 bg-card/40 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight truncate max-w-[200px] sm:max-w-[400px]">
              {title || 'New AI Agent Conversation'}
            </h2>
            <p className="text-[10px] text-muted-foreground">Autonomous Agent Engine & Tools Active</p>
          </div>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="appearance-none bg-accent text-xs font-semibold px-3 py-1.5 pr-7 rounded-xl border border-border focus:outline-none cursor-pointer"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced)</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-2.5 text-muted-foreground pointer-events-none" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            title="Conversation System Prompt"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* System Prompt Modal Banner */}
      {showSettings && (
        <div className="p-4 border-b bg-purple-500/10 border-purple-500/20 text-xs space-y-2">
          <label className="font-semibold text-purple-600 dark:text-purple-400">System Instruction Prompt</label>
          <input
            type="text"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. You are an expert AI Agent capable of tool execution..."
            className="w-full p-2 rounded-lg border bg-background text-xs focus:outline-none"
          />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto pt-16">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">AI Agent Platform Active</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions, execute live web searches, calculate math, encode base64, run JS code, or query knowledge bases.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs w-full pt-4">
              <button
                onClick={() => onSendMessage('Search the web for the latest artificial intelligence news.', [])}
                className="p-3 rounded-xl border bg-card hover:bg-accent text-left font-medium transition-colors"
              >
                🌐 Web Search: Latest AI News
              </button>
              <button
                onClick={() => onSendMessage('Calculate 15% tip on $240 and 8% tax.', [])}
                className="p-3 rounded-xl border bg-card hover:bg-accent text-left font-medium transition-colors"
              >
                🧮 Calculator: Math Evaluation
              </button>
              <button
                onClick={() => onSendMessage('What is current time and date in Tokyo?', [])}
                className="p-3 rounded-xl border bg-card hover:bg-accent text-left font-medium transition-colors"
              >
                🕒 Datetime: Current Tokyo Time
              </button>
              <button
                onClick={() => onSendMessage('Run JS code: console.log([1, 2, 3].map(x => x * 2));', [])}
                className="p-3 rounded-xl border bg-card hover:bg-accent text-left font-medium transition-colors"
              >
                ⚡ Code Sandbox: Run JS
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onRegenerate={onRegenerate}
                onDelete={onDeleteMessage}
              />
            ))}

            {/* Live Tool Execution Widget */}
            {toolSteps && toolSteps.length > 0 && <ToolExecutionWidget steps={toolSteps} />}

            {/* Streaming Message Buffer */}
            {isStreaming && (
              <MessageItem
                message={{
                  id: streamingMessageId || 'streaming-temp',
                  conversationId: 'temp',
                  role: 'ASSISTANT',
                  content: streamingContent || '▋',
                  status: 'STREAMING',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Floating Scroll-to-Bottom Button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-105 transition-all z-20"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      {/* Composer Input Bar */}
      <div className="shrink-0">
        <Composer onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
