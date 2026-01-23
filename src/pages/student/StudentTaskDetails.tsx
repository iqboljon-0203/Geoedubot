import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  FileText, 
  Download, 
  MoreHorizontal, 
  Paperclip,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { SubmitAnswerModal } from '@/components/modals/SubmitAnswerModal';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function StudentTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    
    try {
      // Fetch task info
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          groups (name),
          profiles:created_by (full_name)
        `)
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // Check for existing submission
      if (userId) {
        const { data: subData } = await supabase
          .from('answers')
          .select('*')
          .eq('task_id', taskId)
          .eq('user_id', userId)
          .single();
          
        setSubmission(subData);
        
        // If graded, redirect to results page
        if (subData?.score !== null && subData?.score !== undefined) {
           // We'll handle this redirection or show simple status
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) return null;

  const isLate = new Date(task.deadline) < new Date();
  const timeLeft = formatDistanceToNow(new Date(task.deadline), { addSuffix: true });

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-zinc-900 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-semibold">{task.groups?.name || 'Group Task'}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-900 text-white">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
        {/* Badges & Title */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
              {task.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
              Unit 4
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            {task.title}
          </h1>
          
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <span>Assigned by</span>
            <span className="text-white font-medium">{task.profiles?.full_name || 'Instructor'}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 p-5 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-orange-400 mb-2 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Deadline
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatDistanceToNow(new Date(task.deadline)).replace('about ', '')}
              </div>
              <div className="text-sm text-zinc-500">Remaining</div>
            </div>
            <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-orange-500/10 rotate-12" />
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-5 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-purple-400 mb-2 font-bold text-xs uppercase tracking-wider">
                <Star className="w-4 h-4" />
                Grade
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {task.max_score || 100}
              </div>
              <div className="text-sm text-zinc-500">Points possible</div>
            </div>
            <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-purple-500/10 rotate-12" />
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold">Instructions</h2>
          </div>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed">
            <p>{task.description}</p>
          </div>
        </Card>

        {/* Resources */}
        {task.file_url && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-zinc-400" />
                <h3 className="font-bold">Resources</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">1 file</span>
            </div>
            
            <Card 
              className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4 hover:bg-zinc-800/80 transition-colors cursor-pointer group"
              onClick={() => window.open(task.file_url, '_blank')}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">Included Resource</h4>
                <p className="text-xs text-zinc-500">Click to view/download</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-black border border-zinc-800 flex items-center justify-center group-hover:border-blue-500/50 group-hover:text-blue-500 transition-colors">
                <Download className="w-5 h-5" />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-20">
        <div className="max-w-3xl mx-auto">
          {submission ? (
            <Button 
              onClick={() => {
                 if (submission.score !== null) {
                   navigate(`/student-dashboard/tasks/${taskId}/result`);
                 } else {
                   // View pending submission
                   // Typically we might show status or allow re-submit
                   setIsSubmitOpen(true);
                 }
              }}
              className="w-full h-14 rounded-2xl bg-zinc-800 text-white font-bold text-lg hover:bg-zinc-700 border border-zinc-700"
            >
              {submission.score !== null ? 'View Result' : 'View Your Submission'}
            </Button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSubmitOpen(true)}
              className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors"
            >
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 rotate-90" />
              </div>
              Submit Answer
            </motion.button>
          )}
        </div>
      </div>

      <SubmitAnswerModal 
        isOpen={isSubmitOpen} 
        onClose={() => setIsSubmitOpen(false)}
        taskId={taskId}
        existingSubmission={submission}
        onSuccess={() => {
          fetchTaskDetails();
          setIsSubmitOpen(false);
        }}
      />
    </div>
  );
}
