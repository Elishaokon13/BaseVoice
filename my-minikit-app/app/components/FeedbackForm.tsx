"use client";

import { useState } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Transaction, TransactionButton } from "@coinbase/onchainkit/transaction";
import { Button } from "./DemoComponents";

const CATEGORIES = [
  'Speed & Performance',
  'Ease of Use',
  'Ideas & Requests',
  'Community Support',
  'Developer Experience',
  'Other'
] as const;

export function FeedbackForm() {
  const { context } = useMiniKit();
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback || !category || !context?.user?.fid) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          category,
          fid: context.user.fid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Clear form on success
      setFeedback('');
      setCategory(CATEGORIES[0]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` || "0x0000000000000000000000000000000000000000";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--app-foreground)]">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
          className="w-full p-2 rounded bg-[var(--app-background)] border border-[var(--app-border)] text-[var(--app-foreground)]"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--app-foreground)]">
          Your Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback (max 1000 characters)"
          maxLength={1000}
          rows={4}
          className="w-full p-2 rounded bg-[var(--app-background)] border border-[var(--app-border)] text-[var(--app-foreground)]"
        />
      </div>

      <Transaction
        calls={[
          {
            to: contractAddress,
            value: BigInt('393500000000000'), // 0.0003935 ETH
          }
        ]}
        onSuccess={handleSubmit}
      >
        <TransactionButton>
          <Button
            disabled={isSubmitting || !feedback || !category}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </TransactionButton>
      </Transaction>
    </div>
  );
} 