'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { CreditCard, Check, Zap, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
  const queryClient = useQueryClient();

  const { data: orgs } = useQuery({
    queryKey: ['userOrganizations'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/organizations');
      return res.data;
    },
  });

  const activeOrg = orgs?.[0];

  const { data: sub } = useQuery({
    queryKey: ['subscription', activeOrg?.id],
    queryFn: async () => {
      if (!activeOrg?.id) return null;
      const res = await apiClient.get<any>(`/billing/${activeOrg.id}`);
      return res.data;
    },
    enabled: !!activeOrg?.id,
  });

  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      if (!activeOrg?.id) return;
      await apiClient.post(`/billing/${activeOrg.id}/upgrade`, { tier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', activeOrg?.id] });
    },
  });

  const plans = [
    {
      name: 'Free Tier',
      tier: 'FREE',
      price: '$0',
      period: 'forever',
      features: ['Gemini 1.5 Flash Access', 'Basic Web Search Tool', '1 Knowledge Base', 'Standard Support'],
    },
    {
      name: 'Pro Tier',
      tier: 'PRO',
      price: '$29',
      period: 'per month',
      popular: true,
      features: ['Gemini 2.0 Flash & Pro', 'Unlimited Web Search & Math Tools', '5 Knowledge Bases (50MB Files)', 'Code Sandbox Execution', 'Priority Streaming'],
    },
    {
      name: 'Business Tier',
      tier: 'BUSINESS',
      price: '$99',
      period: 'per month',
      features: ['All Pro Features', 'Multi-tenant Workspaces', 'Shared Team Prompt Library', 'Image Generation Provider', 'Workflow Pipelines', 'SOC2 Audit Trail'],
    },
    {
      name: 'Enterprise Tier',
      tier: 'ENTERPRISE',
      price: '$499',
      period: 'per month',
      features: ['Custom AI Models', 'Dedicated Vector Store Engine', 'Unlimited API Keys & Webhooks', 'Custom Domain & SSO / SAML', '24/7 Dedicated SLA Support'],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-none">Billing & Usage Architecture</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Subscriptions & Metered Usage</h2>
          <p className="text-purple-100 text-sm max-w-xl">
            Upgrade your plan, manage payment methods, download invoices, and monitor token credits.
          </p>
        </div>
        <CreditCard className="h-16 w-16 text-white/20 hidden md:block" />
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.tier}
            className={`relative flex flex-col justify-between p-6 ${
              sub?.tier === plan.tier ? 'border-primary ring-2 ring-purple-500/50 bg-primary/5' : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                Most Popular
              </Badge>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => upgradeMutation.mutate(plan.tier)}
              disabled={sub?.tier === plan.tier || upgradeMutation.isPending}
              className={`w-full mt-6 font-semibold ${
                sub?.tier === plan.tier ? 'bg-accent text-foreground' : 'bg-primary text-primary-foreground'
              }`}
            >
              {sub?.tier === plan.tier ? 'Current Active Plan' : `Upgrade to ${plan.tier}`}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
