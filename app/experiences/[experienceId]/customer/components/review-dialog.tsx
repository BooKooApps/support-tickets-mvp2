'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star } from 'lucide-react';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  ticketTitle: string;
  onReviewSubmitted?: () => void;
}

export function ReviewDialog({
  open,
  onOpenChange,
  ticketId,
  ticketTitle,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          rating,
          feedback: feedback.trim() || null,
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        // Call the callback if provided
        onReviewSubmitted?.();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Rate Your Support Experience</DialogTitle>
          <DialogDescription>
            How was your experience with "{ticketTitle}"?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-3'>
            <Label>Rating (Required)</Label>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setRating(star)}
                  className='p-1 hover:scale-110 transition-transform'
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className='text-sm text-gray-600'>
                {rating === 1 &&
                  "We're sorry to hear that. We'll work to improve."}
                {rating === 2 &&
                  'We appreciate your feedback and will do better.'}
                {rating === 3 && 'Thank you for your feedback.'}
                {rating === 4 && "Great! We're glad we could help."}
                {rating === 5 &&
                  'Excellent! Thank you for the amazing feedback.'}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='feedback'>Additional Feedback (Optional)</Label>
            <Textarea
              id='feedback'
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder='Tell us more about your experience...'
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Skip Review
            </Button>
            <Button type='submit' disabled={isLoading || rating === 0}>
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
