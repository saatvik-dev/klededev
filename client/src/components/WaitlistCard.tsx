import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { addToWaitlist } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import KledeLogo from './KledeLogo';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';

type EmailFormValues = z.infer<typeof emailSchema>;

const WaitlistCard: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    }
  });
  
  const mutation = useMutation({
    mutationFn: (data: EmailFormValues) => {
      // Display a loading toast
      toast({
        title: "Submitting...",
        description: "Adding your email to our waitlist",
      });
      
      return addToWaitlist(data.email);
    },
    onSuccess: (response) => {
      console.log("Waitlist submission succeeded:", response);
      
      // Clear any existing toasts
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. Check your email for confirmation.",
        variant: "default",
      });
      
      setIsSuccess(true);
    },
    onError: async (error: any) => {
      console.error("Waitlist submission error:", error);
      
      // Check if it's a duplicate email (HTTP 409)
      if (error.message && error.message.includes("409")) {
        toast({
          title: "Already registered",
          description: "This email is already on our waitlist.",
          variant: "default",
        });
        setIsSuccess(true); // Still show success UI for duplicates
        return;
      }
      
      // Try super aggressive direct fetch fallbacks using multiple paths
      try {
        console.log("Trying direct fetch fallbacks for waitlist submission");
        const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
        
        if (!email || !email.includes('@')) {
          throw new Error("No valid email found for fallback submission");
        }
        
        console.log(`Using fallback with email: ${email}`);
        const baseUrl = window.location.origin;
        
        // Try multiple possible endpoints
        const possibleEndpoints = [
          `${baseUrl}/.netlify/functions/api-standalone/api/waitlist`,
          `${baseUrl}/.netlify/functions/api-standalone`,
          `${baseUrl}/api/waitlist`,
          `${baseUrl}/waitlist`
        ];
        
        // Try each endpoint until one works
        for (const endpoint of possibleEndpoints) {
          try {
            console.log(`Trying fallback endpoint: ${endpoint}`);
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            
            const responseText = await response.text();
            console.log(`Response from ${endpoint}:`, responseText);
            
            if (response.ok) {
              console.log(`Success with fallback endpoint: ${endpoint}`);
              
              toast({
                title: "Success!",
                description: "You've been added to our waitlist. Check your email for confirmation.",
                variant: "default",
              });
              
              setIsSuccess(true);
              return; // Exit the error handler
            }
          } catch (endpointError) {
            console.error(`Error with fallback endpoint ${endpoint}:`, endpointError);
            // Continue to next endpoint
          }
        }
        
        // If we get here, all fallbacks failed
        throw new Error("All fallback attempts failed");
      } catch (fallbackError) {
        console.error("All fallback attempts failed:", fallbackError);
        
        // For other errors, show detailed error message
        toast({
          title: "Unable to join waitlist",
          description: `We're experiencing technical difficulties. Please try again later or contact support.`,
          variant: "destructive",
        });
      }
    }
  });
  
  const onSubmit = (data: EmailFormValues) => {
    mutation.mutate(data);
  };
  
  return (
    <div className="w-full max-w-md bg-transparent">
      <KledeLogo />
      
      {!isSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2 animate-fadeIn">
          <h1 className="text-center text-2xl font-medium text-white mb-6 animate-glow">
            Join the waitlist for exclusive access to our upcoming collection
          </h1>
          
          <div className="transform transition-all duration-500 hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-lg">
              <input 
                type="email" 
                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-300`}
                placeholder="Enter your email"
                {...register('email')}
                disabled={mutation.isPending}
                style={{
                  boxShadow: 'none',
                  transform: 'translateY(0)'
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.4)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-white transform scale-x-0 transition-transform duration-300 origin-left"></div>
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-70 overflow-hidden relative"
            disabled={mutation.isPending}
            style={{
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              
              // Create ripple effect
              const button = e.currentTarget;
              const circle = document.createElement('span');
              const diameter = Math.max(button.clientWidth, button.clientHeight);
              
              circle.style.width = circle.style.height = `${diameter}px`;
              circle.style.left = `${e.clientX - button.offsetLeft - diameter / 2}px`;
              circle.style.top = `${e.clientY - button.offsetTop - diameter / 2}px`;
              circle.classList.add('ripple');
              
              const ripple = button.getElementsByClassName('ripple')[0];
              if (ripple) {
                ripple.remove();
              }
              
              button.appendChild(circle);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {mutation.isPending ? (
              <span className="flex justify-center items-center space-x-2">
                <span className="loading-dot w-2 h-2 bg-black rounded-full animate-pulse"></span>
                <span className="loading-dot w-2 h-2 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="loading-dot w-2 h-2 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </span>
            ) : (
              "Join Waitlist"
            )}
          </button>
        </form>
      ) : (
        <div className="text-center py-8 mt-8 transform transition-all duration-700 ease-in-out">
          <div className="animate-bounce-slow inline-flex p-4 bg-black/30 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <h2 className="mt-4 text-2xl font-medium text-white animate-fadeIn">You're on the list!</h2>
          <p className="mt-3 text-gray-300 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            Thank you for your interest in our collection.
          </p>
          <p className="mt-1 text-gray-400 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            We'll notify you when we launch.
          </p>
        </div>
      )}
    </div>
  );
};

export default WaitlistCard;
