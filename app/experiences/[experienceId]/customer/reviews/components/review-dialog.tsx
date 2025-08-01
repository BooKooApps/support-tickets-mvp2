'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
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
import { Check, Loader2, Star } from 'lucide-react';
import { ReviewResponse } from '@/app/api/reviews/route';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId?: string;
  ticketTitle?: string;
  onReviewSubmitted?: () => void;
  review?: ReviewResponse;
}

export function ReviewDialog({
  open,
  onOpenChange,
  ticketId,
  ticketTitle,
  onReviewSubmitted,
  review,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) return;

    setIsLoading(true);
    try {
      const method = review ? 'PUT' : 'POST';
      const body = review
        ? {
            reviewId: review.id,
            rating,
            feedback: feedback.trim() || null,
          }
        : {
            ticketId,
            rating,
            feedback: feedback.trim() || null,
          };

      const response = await fetch('/api/reviews', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setFeedback(review.feedback || '');
    }
  }, [review]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Rate Your Support Experience</DialogTitle>
          {ticketTitle && (
            <DialogDescription>
              How was your experience with "{ticketTitle}"?
            </DialogDescription>
          )}

          {review && <DialogDescription>Edit your review</DialogDescription>}
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
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className='p-1 hover:scale-110 transition-transform'
                >
                  <Star
                    className={`h-8 w-8 ${
                      (
                        hoverRating !== null
                          ? star <= hoverRating
                          : star <= rating
                      )
                        ? 'fill-primary text-primary dark:drop-shadow-[0_4px_16px_rgba(255,101,36,1)]'
                        : 'text-gray-300 hover:text-primary'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoverRating ?? rating) > 0 ? (
              <p className='text-sm text-muted-foreground'>
                {(hoverRating ?? rating) === 1 &&
                  "We're sorry to hear that. We'll work to improve."}
                {(hoverRating ?? rating) === 2 &&
                  'We appreciate your feedback and will do better.'}
                {(hoverRating ?? rating) === 3 &&
                  'Thank you for your feedback.'}
                {(hoverRating ?? rating) === 4 &&
                  "Great! We're glad we could help."}
                {(hoverRating ?? rating) === 5 &&
                  'Excellent! Thank you for the amazing feedback.'}
              </p>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Please rate your experience
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
            <Button type='submit' disabled={isLoading || rating === 0}>
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
              ) : (
                <Check className='h-4 w-4 mr-2' />
              )}
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
