'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop, Bell, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/services/api.service';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSavePreferences = async () => {
    try {
      setSaveStatus('Saving...');
      await apiClient.put('/users/preferences', {
        theme: (theme?.toUpperCase() as any) || 'SYSTEM',
        emailNotifications: notifications,
        twoFactorEnabled: twoFactor,
      });
      setSaveStatus('Preferences saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Failed to save preferences');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance & Theme</CardTitle>
          <CardDescription>Customize the application interface styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'light' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'hover:bg-accent'
              }`}
            >
              <Sun className="h-6 w-6 text-amber-500" />
              <span className="text-sm">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'dark' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'hover:bg-accent'
              }`}
            >
              <Moon className="h-6 w-6 text-indigo-400" />
              <span className="text-sm">Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'system' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'hover:bg-accent'
              }`}
            >
              <Laptop className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm">System Default</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Notifications</CardTitle>
          <CardDescription>Configure alerts and security features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive security updates and login activity alerts</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-muted-foreground">Require secondary verification token on login</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button onClick={handleSavePreferences} className="bg-primary text-primary-foreground font-semibold">
              Save Preferences
            </Button>
            {saveStatus && <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{saveStatus}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
