import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  FileText,
  ArrowRight,
  Share2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function StudentTaskResult() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [taskId]);

  const fetchResult = async () => {
    if (!taskId || !userId) return;
    
    try {
      // Fetch submission with task info
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          tasks:task_id (
            title,
            max_score,
            type,
            profiles:created_by (full_name)
          )
        `)
        .eq('task_id', taskId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setResult(data);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!result) return null;

  const maxScore = result.tasks?.max_score || 10;
  const score = result.score || 0;
  const percentage = (score / maxScore) * 100;
  
  let gradeColor = 'text-red-500';
  let gradeText = 'Needs Improvement';
  if (percentage >= 90) {
    gradeColor = 'text-green-500';
    gradeText = 'Excellent Work';
  } else if (percentage >= 70) {
    gradeColor = 'text-blue-500';
    gradeText = 'Good Job';
  } else if (percentage >= 50) {
    gradeColor = 'text-yellow-500';
    gradeText = 'Passed';
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-zinc-900 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold">Task Results</span>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-900 text-white">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
        {/* Score Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Final Grade</div>
            
            <div className="relative inline-block mb-4">
               <span className={cn("text-8xl font-bold tracking-tighter", gradeColor)}>
                 {score}
               </span>
               <span className="text-2xl text-zinc-500 font-medium ml-2">
                 /{maxScore}
               </span>
            </div>
            
            <div className={cn("px-4 py-1 rounded-full text-sm font-bold bg-opacity-20 inline-block uppercase tracking-wide", 
               percentage >= 90 ? 'bg-green-500/20 text-green-500' :
               percentage >= 70 ? 'bg-blue-500/20 text-blue-500' :
               percentage >= 50 ? 'bg-yellow-500/20 text-yellow-500' :
               'bg-red-500/20 text-red-500'
            )}>
              {gradeText}
            </div>
          </div>
          
          <div className="absolute top-4 right-4 text-green-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </Card>

        {/* Feedback */}
        {result.teacher_comment && (
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold">Instructor Feedback</h3>
                <p className="text-xs text-zinc-500">{result.tasks?.profiles?.full_name}</p>
              </div>
            </div>
            <p className="text-zinc-300 italic">"{result.teacher_comment}"</p>
          </Card>
        )}

        {/* Task Info Summary */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex gap-2 mb-3">
             <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-400 text-xs font-bold uppercase">
               {result.tasks?.type}
             </span>
             <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs font-bold uppercase">
               Homework
             </span>
          </div>
          <h2 className="text-xl font-bold mb-1">{result.tasks?.title}</h2>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="bg-zinc-900 border-zinc-800 p-4">
             <div className="flex items-center gap-2 mb-2">
               <CheckCircle2 className="w-4 h-4 text-green-500" />
               <span className="text-xs font-bold text-green-500 uppercase">Status</span>
             </div>
             <div className="text-xl font-bold text-white">Graded</div>
             <div className="text-xs text-zinc-500">
               {new Date(result.graded_at || result.created_at).toLocaleDateString()}
             </div>
           </Card>
           
           <Card className="bg-zinc-900 border-zinc-800 p-4">
             <div className="flex items-center gap-2 mb-2">
               <Star className="w-4 h-4 text-yellow-500" />
               <span className="text-xs font-bold text-yellow-500 uppercase">Points</span>
             </div>
             <div className="text-xl font-bold text-white">{score} / {maxScore}</div>
             <div className="text-xs text-zinc-500">
               +{Math.round(score * 1.5)} Bonus XP
             </div>
           </Card>
        </div>

        {/* Your Submission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-400" />
            <h3 className="font-bold">Your Submission</h3>
          </div>
          
          <Card className="bg-zinc-900 border-zinc-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                 <FileText className="w-6 h-6 text-blue-500" />
               </div>
               <div>
                 <h4 className="font-semibold text-white truncate max-w-[200px]">
                   {result.file_url ? 'Attached File' : 'Text Submission'}
                 </h4>
                 <p className="text-xs text-zinc-500">
                   Submitted {new Date(result.created_at).toLocaleDateString()}
                 </p>
               </div>
            </div>
            {result.file_url && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-400 hover:text-blue-300"
                onClick={() => window.open(result.file_url, '_blank')}
              >
                View Full
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-20">
        <div className="max-w-3xl mx-auto flex gap-3">
           <Button 
             onClick={() => navigate('/student-dashboard')}
             variant="secondary"
             className="flex-1 h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
           >
             Back to Dashboard
           </Button>
           
           <Button 
             onClick={() => navigate('/student-dashboard/tasks')}
             className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
           >
             Next Task
             <ArrowRight className="w-5 h-5 ml-2" />
           </Button>
        </div>
      </div>
    </div>
  );
}
