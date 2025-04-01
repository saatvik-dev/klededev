import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

// Form validation schema
const waitlistSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().optional(),
  referralSource: z.string().optional(),
  referralCode: z.string().optional()
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  className?: string;
}

const WaitlistForm = ({ className = '' }: WaitlistFormProps) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  
  // Get referral code from URL if present
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<{ referralCode: string; referrerName: string | null; valid: boolean } | null>(null);
  
  // Extract referral code from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('ref');
    if (code) {
      setReferralCode(code);
    }
  }, []);
  
  // Fetch referrer info if referral code exists
  const { isLoading: isLoadingReferrer } = useQuery({
    queryKey: ['referral', referralCode],
    queryFn: async () => {
      if (!referralCode) return null;
      const response = await apiRequest(`api/waitlist/referral/${referralCode}`);
      setReferrer(response);
      return response;
    },
    enabled: !!referralCode,
    retry: false
  });
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, reset } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: '',
      name: '',
      referralSource: '',
      referralCode: referralCode || ''
    }
  });
  
  // Update the referral code in the form when it changes
  useEffect(() => {
    if (referralCode) {
      setValue('referralCode', referralCode);
    }
  }, [referralCode, setValue]);

  const { mutate } = useMutation({
    mutationFn: async (data: WaitlistFormValues) => {
      return await apiRequest('api/waitlist', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setSubmissionResult(data.entry);
      toast({
        title: "Success!",
        description: "You've been added to our waitlist.",
        variant: "default",
      });
      reset();
      setIsSubmitted(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: WaitlistFormValues) => {
    mutate(data);
  };

  if (isSubmitted) {
    const currentUrl = window.location.origin + window.location.pathname;
    const referralUrl = submissionResult?.referralCode 
      ? `${currentUrl}?ref=${submissionResult.referralCode}`
      : null;
    
    return (
      <div className={`p-6 rounded-lg shadow-md ${className}`}>
        <h3 className="text-xl font-bold mb-2">Thanks for joining!</h3>
        <p className="mb-4">We'll keep you updated on our exclusive collection launch.</p>
        
        {referralUrl && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-medium mb-2">Share with friends to earn rewards!</h4>
            <p className="text-sm mb-3">
              Invite others to join and earn points toward exclusive rewards.
            </p>
            <div className="flex items-center mb-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-grow p-2 text-sm border border-gray-300 rounded-l"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                className="bg-primary text-white p-2 rounded-r"
                onClick={() => {
                  navigator.clipboard.writeText(referralUrl);
                  toast({
                    title: "Copied!",
                    description: "Referral link copied to clipboard",
                    variant: "default",
                  });
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}
        
        <button 
          className="px-4 py-2 rounded bg-primary text-white"
          onClick={() => setIsSubmitted(false)}
        >
          Join with another email
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg shadow-md ${className}`}>
      <h3 className="text-xl font-bold mb-2">Join our waitlist</h3>
      <p className="mb-4">Get early access to our exclusive collection.</p>
      
      {referralCode && referrer && referrer.valid && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
          <p className="text-sm text-green-800">
            {referrer.referrerName ? (
              <>You were invited by <strong>{referrer.referrerName}</strong></>
            ) : (
              <>You're using an invite link</>
            )}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={`w-full p-2 border rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block mb-1">
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            className="w-full p-2 border border-gray-300 rounded"
            {...register('name')}
          />
        </div>

        <div>
          <label htmlFor="referralSource" className="block mb-1">
            How did you hear about us? (optional)
          </label>
          <select
            id="referralSource"
            className="w-full p-2 border border-gray-300 rounded"
            {...register('referralSource')}
          >
            <option value="">Select an option</option>
            <option value="social">Social Media</option>
            <option value="friend">Friend or Family</option>
            <option value="search">Search Engine</option>
            <option value="advertisement">Advertisement</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Hidden referral code field */}
        <input type="hidden" {...register('referralCode')} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
        </button>
      </form>
    </div>
  );
};

export default WaitlistForm;