import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info, Users, Clipboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export const JoinGroup = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setCode(text.trim());
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleJoinGroup = async () => {
    if (!code.trim() || !userId) return;

    setIsJoining(true);
    try {
      // Find group by code (ID)
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('id', code.trim())
        .single();

      if (groupError || !group) {
        toast.error(t('groups.not_found'));
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
        toast.info(t('groups.already_member'));
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

      toast.success(t('groups.join_success', { name: group.name }));
      navigate('/student-dashboard/groups');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(t('groups.join_error'));
    } finally {
      setIsJoining(false);
    }
  };

  const isFilled = code.trim().length > 5;

  return (
    <div className="p-0">
      {/* Premium Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-card/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-accent"
              aria-label={t('common.back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">{t('groups.join')}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center shadow-inner group">
              <Users className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">{t('groups.enter_id')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {t('groups.enter_id_desc')}
            </p>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <div className="relative group">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 861eeb32-186c..."
                className="h-16 text-lg pr-14 font-mono bg-card rounded-2xl border-border focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-12 w-12 text-muted-foreground hover:text-primary rounded-xl"
                onClick={handlePaste}
                title={t('common.paste', { defaultValue: "Nusxalash" })}
              >
                <Clipboard className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoinGroup}
            disabled={!isFilled || isJoining}
            className={cn(
              'w-full h-16 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]',
              isFilled
                ? 'bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90 shadow-primary/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {isJoining ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                {t('common.processing', { defaultValue: "Jarayonda..." })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                {t('common.next')}
                <ArrowRight className="w-6 h-6" />
              </div>
            )}
          </Button>

          {/* Help Text */}
          <button
            onClick={() => navigate('/student-dashboard/groups')}
            className="w-full text-center text-muted-foreground hover:text-primary font-medium transition-colors text-sm"
          >
            {t('groups.dont_have_code')}
          </button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Card className="p-6 bg-muted/30 border-dashed border-2 border-border/50 rounded-3xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('groups.id_help')}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinGroup;
