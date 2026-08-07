'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/stores/chat.store';
import { apiClient } from '@/services/api.service';
import { Conversation } from '@chatbot/types';
import { OrgSwitcher } from './org-switcher';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
  Settings,
  Shield,
  Database,
  Wrench,
  GitBranch,
  BarChart3,
  Building2,
  CreditCard,
  BookOpen,
  Key,
} from 'lucide-react';

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { activeConversationId, setActiveConversationId } = useChatStore();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { data: convData } = useQuery({
    queryKey: ['conversations', search],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/conversations${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      return res.data;
    },
  });

  const conversations: Conversation[] = convData?.items || [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Conversation> }) => {
      await apiClient.put(`/conversations/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/conversations/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
  });

  const handleStartNewChat = () => {
    setActiveConversationId(null);
  };

  const handleRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      updateMutation.mutate({ id, updates: { title: editTitle.trim() } });
    }
  };

  const togglePin = (conv: Conversation) => {
    updateMutation.mutate({ id: conv.id, updates: { isPinned: !conv.isPinned } });
  };

  const pinnedList = conversations.filter((c) => c.isPinned);
  const recentList = conversations.filter((c) => !c.isPinned);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300 z-30 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64 md:w-72',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Bot className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
              AI Platform
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Multi-Tenant Org Switcher & New Chat */}
      <div className="p-3 space-y-2">
        {!collapsed && <OrgSwitcher />}
        <button
          onClick={handleStartNewChat}
          className={cn(
            'w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white',
            collapsed && 'px-0 justify-center',
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Enterprise SaaS Suite Navigation */}
      <div className="px-3 pb-2 space-y-1">
        <Link
          href="/knowledge"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/knowledge' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Database className="h-3.5 w-3.5 text-purple-500 shrink-0" />
          {!collapsed && <span>Knowledge (RAG)</span>}
        </Link>
        <Link
          href="/tools"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/tools' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Wrench className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          {!collapsed && <span>Tools Gallery</span>}
        </Link>
        <Link
          href="/prompts"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/prompts' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <BookOpen className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          {!collapsed && <span>Prompt Library</span>}
        </Link>
        <Link
          href="/workflows"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/workflows' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <GitBranch className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          {!collapsed && <span>Workflows</span>}
        </Link>
        <Link
          href="/billing"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/billing' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <CreditCard className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          {!collapsed && <span>Billing & Subscriptions</span>}
        </Link>
        <Link
          href="/apikeys"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/apikeys' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Key className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          {!collapsed && <span>API Keys</span>}
        </Link>
        <Link
          href="/org/settings"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/org/settings' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          {!collapsed && <span>Org & Teams</span>}
        </Link>
        <Link
          href="/analytics"
          className={cn(
            'flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/analytics' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <BarChart3 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
          {!collapsed && <span>Admin Analytics</span>}
        </Link>
      </div>

      {/* Search Input */}
      {!collapsed && (
        <div className="px-3 pb-2 pt-2 border-t border-border">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-accent/50 text-xs border border-border focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4">
        {pinnedList.length > 0 && (
          <div className="space-y-1">
            {!collapsed && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Pinned</p>}
            {pinnedList.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  'group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all',
                  activeConversationId === conv.id
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Pin className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  {!collapsed && <span className="truncate">{conv.title}</span>}
                </div>

                {!collapsed && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                    <button onClick={(e) => { e.stopPropagation(); togglePin(conv); }} title="Unpin">
                      <Pin className="h-3 w-3 fill-current text-purple-500" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleRename(conv); }} title="Rename">
                      <Edit2 className="h-3 w-3 hover:text-foreground" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(conv.id); }} title="Delete">
                      <Trash2 className="h-3 w-3 hover:text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1">
          {!collapsed && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Recent Chats</p>}
          {recentList.length === 0 ? (
            !collapsed && <p className="text-xs text-muted-foreground px-2 py-4">No conversations yet.</p>
          ) : (
            recentList.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  'group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all',
                  activeConversationId === conv.id
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  {!collapsed && (
                    editingId === conv.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => saveRename(conv.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(conv.id)}
                        autoFocus
                        className="bg-background text-foreground border rounded px-1 text-xs w-full"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )
                  )}
                </div>

                {!collapsed && editingId !== conv.id && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                    <button onClick={(e) => { e.stopPropagation(); togglePin(conv); }} title="Pin">
                      <Pin className="h-3 w-3 hover:text-foreground" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleRename(conv); }} title="Rename">
                      <Edit2 className="h-3 w-3 hover:text-foreground" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(conv.id); }} title="Delete">
                      <Trash2 className="h-3 w-3 hover:text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-border p-3 space-y-1">
        <Link
          href="/profile"
          className="flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <User className="h-4 w-4" />
          {!collapsed && <span>Profile</span>}
        </Link>
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Link
          href="/audit-logs"
          className="flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Shield className="h-4 w-4" />
          {!collapsed && <span>Audit Trail</span>}
        </Link>
      </div>
    </aside>
  );
}
