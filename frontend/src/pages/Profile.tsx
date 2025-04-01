import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

interface ProfileProps {
  email?: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  pointsAwarded: number;
  isActive: boolean;
  completed: boolean;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  requiredLevel: number;
}

interface Profile {
  id: number;
  email: string;
  name: string | null;
  level: number;
  points: number;
  referralCode: string;
  tasks: Task[];
  rewards: Reward[];
  gamification: {
    currentLevel: number;
    currentPoints: number;
    nextLevelPoints: number;
    levelProgress: number;
    unlockedRewards: string[];
  };
}

const ProfilePage = ({ email: propEmail }: ProfileProps) => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ email: string }>('/profile/:email');
  const { toast } = useToast();
  
  // Use email from props or URL parameters
  const [email, setEmail] = useState<string | null>(propEmail || (match ? params.email : null));
  const [emailInput, setEmailInput] = useState('');
  
  // Check if there's an email in localStorage
  useEffect(() => {
    if (!email) {
      const storedEmail = localStorage.getItem('waitlist_email');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [email]);
  
  // Store email in localStorage when it changes
  useEffect(() => {
    if (email) {
      localStorage.setItem('waitlist_email', email);
    }
  }, [email]);
  
  // Query profile data
  const { data: profile, isLoading, error, refetch } = useQuery<Profile>({
    queryKey: ['profile', email],
    queryFn: async () => {
      if (!email) throw new Error('Email is required');
      return await apiRequest(`api/waitlist/profile?email=${encodeURIComponent(email)}`);
    },
    enabled: !!email,
    retry: false
  });
  
  // Function to handle completing a task
  const completeTask = async (taskId: number) => {
    if (!email) return;
    
    try {
      const result = await apiRequest('api/waitlist/complete-task', {
        method: 'POST',
        body: JSON.stringify({ email, taskId })
      });
      
      // Show toast with result
      if (result.levelUp) {
        toast({
          title: 'Level Up!',
          description: `Congratulations! You've reached level ${result.newLevel}`,
          variant: 'default',
        });
      } else if (result.alreadyCompleted) {
        toast({
          title: 'Task already completed',
          description: 'You already completed this task',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Task completed!',
          description: 'You earned points for completing this task',
          variant: 'default',
        });
      }
      
      // Refetch profile data to update UI
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete task',
        variant: 'destructive',
      });
    }
  };
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      setEmail(emailInput);
      setLocation(`/profile/${encodeURIComponent(emailInput)}`);
    }
  };
  
  // Show email input form if no email is provided
  if (!email) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Access Your Profile</h1>
        <p className="mb-4">Enter your email to view your waitlist profile and rewards.</p>
        
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1">Email address</label>
            <input
              id="email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            View Profile
          </button>
        </form>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="mb-4">
          We couldn't find a waitlist profile for {email}. Please check your email or join our waitlist.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setEmail(null)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Try Another Email
          </button>
          <button
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Join Waitlist
          </button>
        </div>
      </div>
    );
  }
  
  // Success state - show profile
  const { gamification } = profile;
  const activeTasks = profile.tasks.filter(task => !task.completed);
  const completedTasks = profile.tasks.filter(task => task.completed);
  
  // Generate the referral URL
  const currentUrl = window.location.origin;
  const referralUrl = `${currentUrl}?ref=${profile.referralCode}`;
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {profile.name ? `${profile.name}'s` : 'Your'} Waitlist Profile
        </h1>
        <p className="text-gray-600">{profile.email}</p>
      </div>
      
      {/* Level Progress */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-xs text-gray-500">LEVEL</span>
            <h2 className="text-3xl font-bold">{gamification.currentLevel}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">POINTS</span>
            <p className="font-medium">
              {gamification.currentPoints} / {gamification.nextLevelPoints}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-primary"
            style={{ width: `${gamification.levelProgress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600">
          {gamification.levelProgress < 100 
            ? `${100 - gamification.levelProgress}% to level ${gamification.currentLevel + 1}`
            : 'Max level reached!'
          }
        </p>
      </div>
      
      {/* Referral Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-2">Share Your Referral Link</h2>
        <p className="text-sm mb-3">
          Invite friends to join the waitlist and earn 50 points for each successful referral!
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
        <p className="text-sm text-gray-600">
          Referral count: <span className="font-medium">{profile.subscriberCount || 0}</span>
        </p>
      </div>
      
      {/* Tasks Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Available Tasks</h2>
        {activeTasks.length === 0 ? (
          <p className="text-gray-600">No active tasks available right now. Check back soon!</p>
        ) : (
          <div className="space-y-4">
            {activeTasks.map(task => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">+{task.pointsAwarded} pts</span>
                    <button
                      onClick={() => completeTask(task.id)}
                      className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Completed Tasks</h3>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">{task.title}</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      +{task.pointsAwarded} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Rewards Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Rewards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {profile.rewards.map(reward => {
            const isUnlocked = gamification.unlockedRewards.includes(reward.title) || 
                              reward.requiredLevel <= gamification.currentLevel;
            
            return (
              <div 
                key={reward.id}
                className={`border rounded-lg p-4 ${isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
              >
                <h3 className="font-medium flex items-center">
                  {reward.title}
                  {isUnlocked && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Unlocked
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {isUnlocked 
                    ? 'This reward is available to you'
                    : `Unlocks at level ${reward.requiredLevel}`
                  }
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;