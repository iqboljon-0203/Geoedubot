import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DigitInput } from '@/components/ui/DigitInput';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const JoinGroup = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleJoinGroup = async () => {
    if (code.length !== 6 || !userId) return;

    setIsJoining(true);
    try {
      // Find group by code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('id', code)
        .single();

      if (groupError || !group) {
        toast.error('Invalid group code. Please check and try again.');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        toast.error('You are already a member of this group.');
        return;
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: userId,
        });

      if (joinError) throw joinError;

      toast.success(`Successfully joined ${group.name}!`);
      navigate('/student-dashboard/groups');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const isFilled = code.length === 6;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-0 z-10 bg-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full text-white hover:bg-zinc-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Join Group</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Enter Group ID</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Please type the 6-digit identification code provided by your mentor
              to join the learning session.
            </p>
          </div>

          {/* Digit Input */}
          <div className="flex justify-center">
            <DigitInput
              length={6}
              onChange={handleCodeChange}
              onComplete={handleJoinGroup}
            />
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoinGroup}
            disabled={!isFilled || isJoining}
            className={cn(
              'w-full h-14 rounded-2xl font-semibold text-lg transition-all',
              isFilled
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            )}
          >
            {isJoining ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Joining...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Join Group
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>

          {/* Help Text */}
          <button
            onClick={() => navigate('/student-dashboard/groups')}
            className="w-full text-center text-zinc-400 hover:text-white transition-colors"
          >
            I don't have a code
          </button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="p-4 bg-zinc-900 border-zinc-800">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-400">
                ID codes are unique for each group. Ask your instructor if you're
                having trouble connecting.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinGroup;
