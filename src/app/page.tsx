'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Shield, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { foundry } from 'viem/chains';
import { FEEDBACK_PAYMENT_ABI, FEEDBACK_PAYMENT_ADDRESSES } from '@/constants';
import { parseEther } from 'viem';

interface FeedbackItem {
  _id: string;
  category: string;
  feedback: string;
  created_at: string;
}

const categories = [
  {
    id: 'speed_performance',
    label: 'Speed & Performance',
    description: 'Block times, transaction speeds, network latency',
    icon: '⚡',
  },
  {
    id: 'ease_of_use',
    label: 'Ease of Use',
    description: 'User experience, interface design, onboarding',
    icon: '🎯',
  },
  {
    id: 'feature_request',
    label: 'Feature Request',
    description: 'Share ideas for new features and improvements',
    icon: '✨',
  },
  {
    id: 'community_support',
    label: 'Community Support',
    description: 'Feedback on docs, resources, and community',
    icon: '🌐',
  },
  {
    id: 'developer_experience',
    label: 'Developer Experience',
    description: 'APIs, SDKs, tooling, and dev workflow',
    icon: '⚡',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'General thoughts and suggestions',
    icon: '💭',
  },
];

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [feedbackError, setFeedbackError] = useState<Error | null>(null);

  const canSubmit = isConnected && hasPaid && feedback.trim() && feedback.length <= 1000 && selectedCategory && !isSubmitLoading;

  const { data: hasPaidStatus, refetch: refetchPaymentStatus } = useReadContract({
    abi: FEEDBACK_PAYMENT_ABI,
    address: FEEDBACK_PAYMENT_ADDRESSES[chainId],
    functionName: 'hasPaid',
    args: [address],
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (hasPaidStatus !== undefined) {
      setHasPaid(Boolean(hasPaidStatus));
    }
  }, [hasPaidStatus]);

  useEffect(() => {
    if (isConfirmed) {
      setIsPaymentLoading(false);
      setTxHash(undefined);
      refetchPaymentStatus();
    }
  }, [isConfirmed, refetchPaymentStatus]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const password = process.env.NEXT_PUBLIC_PASSWORD ?? '';
        if (!password) {
          throw new Error('Decryption password not configured.');
        }

        const params = new URLSearchParams({
          password,
          page: '1',
          limit: '10',
          searchTerm: '',
          category: 'all',
        });
        const response = await fetch(`/api/view-feedback?${params.toString()}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch feedback');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch feedback');
        }
        setFeedbackList(data.feedback || []);
      } catch (error: unknown) {
        setFeedbackError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, []);

  const handlePayment = async () => {
    if (!address) return;

    setIsPaymentLoading(true);
    try {
      const hash = await writeContractAsync({
        abi: FEEDBACK_PAYMENT_ABI,
        address: FEEDBACK_PAYMENT_ADDRESSES[chainId],
        functionName: 'pay',
        value: parseEther('0.0003935'),
      });
      setTxHash(hash);
    } catch (error: unknown) {
      setFeedbackError(error instanceof Error ? error : new Error('Payment failed'));
      setIsPaymentLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!feedback.trim() || !selectedCategory) return;

    setIsSubmitLoading(true);
    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback.trim(),
          category: selectedCategory,
          wallet_address: address,
          chainId,
        }),
      });

      if (response.ok) {
        await response.json();
        setShowSuccessModal(true);
        setFeedback('');
        setSelectedCategory('');
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error: unknown) {
      setSubmitStatus('error');
      setFeedbackError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 sm:h-20" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-16 sm:pb-24">
        <div className="text-center space-y-6 sm:space-y-8 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold font-coinbase mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#2151F5]">
            BaseVoice
          </h1>
          {/* <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            Your Voice, Your Privacy
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Submit encrypted feedback securely on Base network. Your privacy is guaranteed through end-to-end encryption.
          </p>
 */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-8">
            <Badge variant="outline" className="gap-2 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Fully Anonymous
            </Badge>
            <Badge variant="outline" className="gap-2 py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Spam Protected
            </Badge>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 mt-8">
            Your feedback helps improve Base. All submissions are encrypted and require a small ETH payment to prevent spam.
            Help shape the future of <span className="font-semibold">Base</span> by providing feedback. Your insights are encrypted and anonymized to ensure
            complete privacy.
          </p>
        </div>

        <Card className="w-full backdrop-blur-sm bg-white/50 dark:bg-black/50 border-2 border-primary/10 shadow-xl shadow-primary/5 overflow-hidden">
            {/* <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-coinbase text-lg sm:text-xl">Submit Feedback</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Share your thoughts to help improve Base
                  </CardDescription>
                </div>
              </div>
            </CardHeader> */}
          
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {!isConnected && (
              <Alert className="flex w-full items-center">
                <AlertCircle className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">
                  Connect your wallet to continue. We only use it for payment verification.
                </AlertDescription>
              </Alert>
            )}

            {isConnected && (
              <div className="space-y-4">
                {!hasPaid && (
                  <Alert className="flex w-full items-center">
                    <AlertCircle className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0" />
                    <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-1">
                      <span className="text-sm sm:text-base">Payment required: ~0.0003935 ETH ($1 equivalent)</span>
                      <Button
                        onClick={handlePayment}
                        disabled={isPaymentLoading}
                        size="sm"
                        className="w-full sm:w-auto hover:cursor-pointer"
                        aria-label="Pay to enable feedback submission"
                      >
                        {isPaymentLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isConfirming ? 'Confirming...' : 'Processing...'}
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {hasPaid && (
                  <Alert className="flex w-full items-center border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0 text-green-600" />
                    <AlertDescription className="flex-1 text-green-800 dark:text-green-200">
                      Payment verified! You can now submit anonymous feedback.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="category-select" className="text-xs sm:text-sm font-mono font-medium">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger
                  id="category-select"
                  className="w-full bg-white/50 dark:bg-black/50 border-2 border-primary/10 hover:border-primary/30 transition-colors"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-2 border-primary/10">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label htmlFor="feedback-textarea" className="text-xs sm:text-sm font-mono font-medium">
                Your Feedback
              </label>
              <Textarea
                id="feedback-textarea"
                placeholder="Share your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[150px] bg-white/50 dark:bg-black/50 border-2 border-primary/10 hover:border-primary/30 transition-colors focus-visible:ring-primary"
              />
              <div className="text-xs text-muted-foreground text-right">
                <span className={feedback.length > 1000 ? 'text-destructive' : ''}>{feedback.length}</span>/1000
                characters
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full font-coinbase-mono text-base hover:cursor-pointer disabled:!cursor-not-allowed bg-primary hover:bg-primary/90 transition-colors"
              size="lg"
              aria-label="Submit anonymous feedback"
            >
              {isSubmitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Anonymous Feedback'
              )}
            </Button>

            {submitStatus === 'error' && (
              <Alert variant="destructive" className="flex w-full items-center">
                <AlertCircle className="h-4 w-4 mr-2 -mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">
                  Failed to submit feedback. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs sm:text-sm text-muted-foreground text-center space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t border-primary/10">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <p className="font-coinbase-mono font-medium text-primary">PRIVACY GUARANTEED</p>
              </div>
              <p className="max-w-md mx-auto leading-relaxed">
                Your feedback is end-to-end encrypted and anonymized. There&apos;s no way to trace feedback back to your
                wallet address.
              </p>
            </div>

            {/* <div className="space-y-4 pt-6">
              <h2 className="text-xl font-bold font-coinbase">Recent Feedback</h2>
              {loadingFeedback ? (
                <div className="text-center text-muted-foreground">Loading feedback...</div>
              ) : feedbackError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{feedbackError.message}</AlertDescription>
                </Alert>
              ) : feedbackList.length === 0 ? (
                <p className="text-muted-foreground text-center">No feedback available.</p>
              ) : (
                <ul className="space-y-4">
                  {feedbackList.map((item) => (
                    <li key={item._id} className="border-b border-primary/10 pb-4">
                      <p className="text-sm font-mono">{item.feedback}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Category: {categories.find((cat) => cat.id === item.category)?.label || item.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(item.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div> */}
          </CardContent>
        </Card>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-background/80 backdrop-blur-md rounded-xl border-2 border-primary/10 p-6 sm:p-8 w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-coinbase bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] to-[#2151F5]">
                Thank You!
              </h2>
              <p className="text-muted-foreground text-center text-lg leading-relaxed">
                Your feedback has been securely submitted. Thank you for helping improve Base.
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="font-coinbase-mono bg-primary hover:bg-primary/90 transition-colors hover:cursor-pointer mt-2"
                aria-label="Close success modal"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}