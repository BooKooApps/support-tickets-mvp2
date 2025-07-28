'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  agentName: string;
  welcomeMessage: string;
  autoMessage: string;
  reminderMessage: string;
  reminderEnabled: boolean;
  reminderHours: number;
}

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>({
    agentName: '',
    welcomeMessage: '',
    autoMessage: '',
    reminderMessage: '',
    reminderEnabled: true,
    reminderHours: 12,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: 'Settings updated',
          description: 'Your support settings have been saved successfully.',
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='agentName'>Agent Name</Label>
            <Input
              id='agentName'
              value={settings.agentName}
              onChange={e =>
                setSettings(prev => ({ ...prev, agentName: e.target.value }))
              }
              placeholder='Support Team'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='welcomeMessage'>Welcome Message</Label>
            <Textarea
              id='welcomeMessage'
              value={settings.welcomeMessage}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  welcomeMessage: e.target.value,
                }))
              }
              placeholder='Welcome message shown to users...'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='autoMessage'>Auto-Response Message</Label>
            <Textarea
              id='autoMessage'
              value={settings.autoMessage}
              onChange={e =>
                setSettings(prev => ({ ...prev, autoMessage: e.target.value }))
              }
              placeholder='Automatic message sent when ticket is created...'
              rows={3}
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Reminder Messages</Label>
                <p className='text-sm text-gray-500'>
                  Send follow-up messages to inactive tickets
                </p>
              </div>
              <Switch
                checked={settings.reminderEnabled}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, reminderEnabled: checked }))
                }
              />
            </div>

            {settings.reminderEnabled && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='reminderHours'>Reminder Delay (hours)</Label>
                  <Input
                    id='reminderHours'
                    type='number'
                    min='1'
                    max='72'
                    value={settings.reminderHours}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        reminderHours: Number.parseInt(e.target.value) || 12,
                      }))
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='reminderMessage'>Reminder Message</Label>
                  <Textarea
                    id='reminderMessage'
                    value={settings.reminderMessage}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        reminderMessage: e.target.value,
                      }))
                    }
                    placeholder='Follow-up message for inactive tickets...'
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
