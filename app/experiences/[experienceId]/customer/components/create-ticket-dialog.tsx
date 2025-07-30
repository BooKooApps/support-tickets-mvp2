'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface CreateTicketDialogProps {
  experienceId: string;
}

export function CreateTicketDialog({ experienceId }: CreateTicketDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `/api/categories?experienceId=${encodeURIComponent(experienceId)}`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tickets?experienceId=${encodeURIComponent(experienceId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            categoryId,
          }),
        }
      );

      if (response.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setCategoryId('');
        setIsLoading(false);
        // Close dialog - WebSocket will handle the UI update
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription className='bg-primary/50 text-primary border p-4 rounded-2xl my-4'>
            Describe your issue and we'll help you resolve it as quickly as
            possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Brief description of your issue'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='category'>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Please provide detailed information about your issue...'
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                // close the dialog
                const dialog = document.querySelector('dialog');
                if (dialog) {
                  dialog.close();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                isLoading || !title.trim() || !description.trim() || !categoryId
              }
            >
              {isLoading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
