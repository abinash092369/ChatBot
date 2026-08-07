'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { apiClient } from '@/services/api.service';
import { Send, Square, Paperclip, X, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function Composer({
  onSendMessage,
}: {
  onSendMessage: (message: string, attachmentIds: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isStreaming,
    stopStreaming,
    pendingFiles,
    addPendingFile,
    updatePendingFile,
    removePendingFile,
    clearPendingFiles,
  } = useChatStore();

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Math.random().toString(36).substring(2, 9);

      const item = { id, file, isUploading: true };
      addPendingFile(item);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await apiClient.post<any>('/chat/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.success && res.data) {
          updatePendingFile(id, { attachmentId: res.data.id, isUploading: false });
        } else {
          removePendingFile(id);
        }
      } catch {
        removePendingFile(id);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if ((!input.trim() && pendingFiles.length === 0) || isStreaming) return;

    const attachmentIds = pendingFiles.map((f) => f.attachmentId).filter(Boolean) as string[];
    onSendMessage(input.trim(), attachmentIds);

    setInput('');
    clearPendingFiles();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* File Previews Chip Container */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-xl bg-card border border-border/60">
          {pendingFiles.map((item) => (
            <div key={item.id} className="relative flex items-center space-x-2 p-2 rounded-lg bg-accent text-xs pr-6">
              {item.file.type.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4 text-purple-500" />
              ) : (
                <FileText className="h-4 w-4 text-indigo-500" />
              )}
              <span className="font-medium max-w-[120px] truncate">{item.file.name}</span>
              {item.isUploading ? (
                <span className="text-[10px] text-muted-foreground animate-pulse">Uploading...</span>
              ) : (
                <button
                  onClick={() => removePendingFile(item.id)}
                  className="absolute right-1 top-1.5 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-2xl focus-within:ring-2 focus-within:ring-purple-500/50 transition-all p-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI anything... (Press Enter to send, Shift+Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground min-h-[44px] max-h-[200px] py-1 px-2"
        />

        {/* Toolbar & Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center space-x-2">
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Attach images, PDFs, CSV, or documents"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <span className="text-[10px] font-mono text-muted-foreground">
              {input.length} chars
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isStreaming ? (
              <Button
                type="button"
                onClick={stopStreaming}
                variant="destructive"
                size="sm"
                className="rounded-xl space-x-1.5 font-semibold"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() && pendingFiles.length === 0}
                size="sm"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-purple-500/20"
              >
                <span>Send</span>
                <Send className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
