'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface CategoriesManagerProps {
  experienceId: string;
}

export function CategoriesManager({ experienceId }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, [experienceId]);

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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCategory,
          experienceId,
        }),
      });

      if (response.ok) {
        const category = await response.json();
        setCategories(prev => [...prev, category]);
        setNewCategory({ name: '', description: '', color: '#3B82F6' });
        toast({
          title: 'Category created',
          description: 'New category has been added successfully.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editForm.name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          experienceId,
        }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(prev =>
          prev.map(cat =>
            cat.id === editingCategory.id ? updatedCategory : cat
          )
        );
        setEditingCategory(null);
        setEditForm({ name: '', description: '', color: '#3B82F6' });
        toast({
          title: 'Category updated',
          description: 'Category has been updated successfully.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(
        `/api/categories/${id}?experienceId=${encodeURIComponent(experienceId)}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        toast({
          title: 'Category deleted',
          description: 'Category has been removed successfully.',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || '',
      color: category.color,
    });
  };

  const closeEditDialog = () => {
    setEditingCategory(null);
    setEditForm({ name: '', description: '', color: '#3B82F6' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Categories</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Existing Categories */}
        <div className='space-y-3'>
          {categories.map(category => (
            <div
              key={category.id}
              className='flex items-center justify-between p-3 border rounded-lg'
            >
              <div className='flex items-center gap-3'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <div className='font-medium'>{category.name}</div>
                  {category.description && (
                    <div className='text-sm text-muted-foreground'>
                      {category.description}
                    </div>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => openEditDialog(category)}
                >
                  <Edit className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Category */}
        <form
          onSubmit={handleCreateCategory}
          className='space-y-4 border-t pt-4'
        >
          <div className='flex items-center gap-2 mb-4'>
            <Plus className='h-4 w-4' />
            <span className='font-medium'>Add New Category</span>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='categoryName'>Name</Label>
              <Input
                id='categoryName'
                value={newCategory.name}
                onChange={e =>
                  setNewCategory(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder='Category name'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='categoryColor'>Color</Label>
              <Input
                id='categoryColor'
                type='color'
                value={newCategory.color}
                onChange={e =>
                  setNewCategory(prev => ({ ...prev, color: e.target.value }))
                }
                className='h-10'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='categoryDescription'>Description (Optional)</Label>
            <Input
              id='categoryDescription'
              value={newCategory.description}
              onChange={e =>
                setNewCategory(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder='Brief description'
            />
          </div>

          <Button
            type='submit'
            disabled={isLoading || !newCategory.name.trim()}
          >
            {isLoading ? 'Creating...' : 'Add Category'}
          </Button>
        </form>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={closeEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCategory} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='editCategoryName'>Name</Label>
                  <Input
                    id='editCategoryName'
                    value={editForm.name}
                    onChange={e =>
                      setEditForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder='Category name'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='editCategoryColor'>Color</Label>
                  <Input
                    id='editCategoryColor'
                    type='color'
                    value={editForm.color}
                    onChange={e =>
                      setEditForm(prev => ({ ...prev, color: e.target.value }))
                    }
                    className='h-10'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='editCategoryDescription'>
                  Description (Optional)
                </Label>
                <Input
                  id='editCategoryDescription'
                  value={editForm.description}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Brief description'
                />
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={closeEditDialog}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading || !editForm.name.trim()}
                >
                  {isLoading ? 'Updating...' : 'Update Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
