'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import Link from 'next/link';

export function OrgSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: orgs } = useQuery({
    queryKey: ['userOrganizations'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/organizations');
      return res.data;
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeOrg = orgs?.find((o) => o.id === selectedOrgId) || orgs?.[0] || { name: 'Personal Workspace', slug: 'personal' };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-card border hover:bg-accent text-xs font-semibold transition-colors w-full justify-between"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <Building2 className="h-4 w-4 text-purple-500 shrink-0" />
          <span className="truncate">{activeOrg.name}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-10 left-0 w-56 p-2 rounded-xl bg-card border shadow-2xl z-50 text-xs space-y-1">
          <p className="font-semibold text-muted-foreground uppercase text-[10px] px-2 py-1">Organizations</p>
          {orgs?.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setSelectedOrgId(org.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-accent text-left font-medium"
            >
              <span className="truncate">{org.name}</span>
              {activeOrg.id === org.id && <Check className="h-3.5 w-3.5 text-purple-500" />}
            </button>
          ))}
          <div className="border-t border-border pt-1">
            <Link
              href="/org/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-2.5 py-2 rounded-lg hover:bg-accent text-purple-600 dark:text-purple-400 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Manage Organizations</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
