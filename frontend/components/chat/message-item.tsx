'use client';

import React, { useState } from 'react';
import { Message } from '@/lib/types';
import { MarkdownRenderer } from './markdown-renderer';
import { Bot, User, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Edit3, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/services/api.service';

export function MessageItem({
  message,
  onRegenerate,
  onEdit,
  onDelete,
}: {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, currentContent: string) => void;
  onDelete?: (messageId: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'USER';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReact = async (type: 'up' | 'down') => {
    try {
      const newReaction = reaction === type ? null : type;
      setReaction(newReaction);
      await apiClient.post(`/messages/${message.id}/react`, { reaction: type });
    } catch {
      // Ignore
    }
  };

  return (
    <div className={`group flex space-x-4 p-4 md:p-6 rounded-2xl transition-colors ${isUser ? 'bg-accent/20' : 'bg-card/40 border border-border/40'}`}>
      {/* Avatar Icon */}
      <div
        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/20'
        }`}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Content Container */}
      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">{isUser ? 'You' : 'ABHI AI'}</span>
            {message.model && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">{message.model}</span>}
          </div>
          <span className="text-[10px] text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Attachments Preview */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.attachments.map((att) => (
              <div key={att.id} className="flex items-center space-x-2 p-2 rounded-lg bg-card border text-xs">
                {att.mimeType.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-purple-500" />
                ) : (
                  <FileText className="h-4 w-4 text-indigo-500" />
                )}
                <span className="font-medium max-w-[150px] truncate">{att.filename}</span>
              </div>
            ))}
          </div>
        )}

        {/* Markdown Content */}
        <MarkdownRenderer content={message.content} />

        {/* Bottom Metadata & Action Bar */}
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          {message.tokensUsed ? (
            <span className="font-mono text-[10px] opacity-70">{message.tokensUsed} tokens</span>
          ) : (
            <span />
          )}

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-background/80 backdrop-blur-sm border rounded-lg p-1">
            <button onClick={handleCopy} title="Copy message" className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            {!isUser && onRegenerate && (
              <button onClick={() => onRegenerate(message.id)} title="Regenerate response" className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}

            {!isUser && (
              <>
                <button
                  onClick={() => handleReact('up')}
                  title="Good response"
                  className={`p-1.5 hover:bg-accent rounded ${reaction === 'up' ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleReact('down')}
                  title="Poor response"
                  className={`p-1.5 hover:bg-accent rounded ${reaction === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {isUser && onEdit && (
              <button onClick={() => onEdit(message.id, message.content)} title="Edit prompt" className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}

            {onDelete && (
              <button onClick={() => onDelete(message.id)} title="Delete message" className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
