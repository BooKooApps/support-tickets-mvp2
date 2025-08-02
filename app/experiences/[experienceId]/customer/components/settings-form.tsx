'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useToast } from '@/hooks/use-toast';
import { Agent } from '@prisma/client';
import { Loader2, Save } from 'lucide-react';

export function SettingsForm({ experienceId }: { experienceId: string }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState({
    isFetching: false,
    isSaving: false,
  });
  const [errors, setErrors] = useState<{
    agentName?: string;
    autoMessage?: string;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAgent();
  }, []);

  const fetchAgent = async () => {
    setIsLoading({
      isFetching: true,
      isSaving: false,
    });
    try {
      const response = await fetch(`/api/agents?experienceId=${experienceId}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading({
        isFetching: false,
        isSaving: false,
      });
    }
  };

  const validate = () => {
    const newErrors: { agentName?: string; autoMessage?: string } = {};
    if (!agent?.agentName) {
      newErrors.agentName = 'Agent name is required';
    } else if (agent.agentName.length > 60) {
      newErrors.agentName = 'Agent name must be at most 60 characters';
    }
    if (!agent?.autoMessage) {
      newErrors.autoMessage = 'Auto-response message is required';
    } else if (agent.autoMessage.length > 500) {
      newErrors.autoMessage =
        'Auto-response message must be at most 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading({
      isFetching: false,
      isSaving: true,
    });

    try {
      const response = await fetch(`/api/agents?experienceId=${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agent),
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
      setIsLoading({
        isFetching: false,
        isSaving: false,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Configuration</CardTitle>
      </CardHeader>
      {isLoading.isFetching ? (
        <CardContent>
          <div className='flex items-center justify-center h-full'>
            <Loader2 className='h-4 w-4 animate-spin' />
          </div>
        </CardContent>
      ) : agent ? (
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='agentName'>Agent Name</Label>
              <Input
                disabled={isLoading.isSaving}
                id='agentName'
                value={agent.agentName}
                maxLength={60}
                onChange={e =>
                  setAgent(prev =>
                    prev ? { ...prev, agentName: e.target.value } : prev
                  )
                }
                placeholder='Support Team'
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{agent.agentName.length}/60</span>
                {errors.agentName && (
                  <span className='text-red-500'>{errors.agentName}</span>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='autoMessage'>Auto-Response Message</Label>
              <Textarea
                disabled={isLoading.isSaving}
                id='autoMessage'
                value={agent.autoMessage}
                maxLength={500}
                onChange={e =>
                  setAgent(prev =>
                    prev ? { ...prev, autoMessage: e.target.value } : prev
                  )
                }
                placeholder='Automatic message sent when ticket is created...'
                rows={3}
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{agent.autoMessage.length}/500</span>
                {errors.autoMessage && (
                  <span className='text-destructive'>{errors.autoMessage}</span>
                )}
              </div>
            </div>

            <Button
              type='submit'
              disabled={
                isLoading.isSaving ||
                !agent.agentName ||
                !agent.autoMessage ||
                agent.agentName.length > 60 ||
                agent.autoMessage.length > 500
              }
            >
              {isLoading.isSaving ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Save Settings
                </>
              )}
            </Button>
          </form>
        </CardContent>
      ) : (
        <CardContent>
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <p>
              No agent found.
              <br />
              Try reloading the page. If the error persists, please contact
              support.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
