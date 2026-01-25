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
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { SubmitAnswerModal } from '@/components/modals/SubmitAnswerModal';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, isPast, isToday, isValid } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function StudentTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { t } = useTranslation();
  
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
          groups (name, lat, lng),
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
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        setSubmission(subData);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineInfo = () => {
    const dateStr = task.type === 'internship' ? task.date : task.deadline;
    if (!dateStr) return { text: "Muddatsiz", subtext: "Muhlat", isOverdue: false, icon: Calendar };
    
    const date = new Date(dateStr);
    if (!isValid(date) || date.getFullYear() < 2000) return { text: "----", subtext: "Sana", isOverdue: false, icon: Calendar };

    if (isToday(date)) return { text: "Bugun", subtext: task.type === 'internship' ? "Amaliyot kuni" : "Muddati", isOverdue: false, icon: Clock };
    
    if (isPast(date)) return { text: "Yakunlandi", subtext: "Holati", isOverdue: true, icon: Clock };
    
    return { 
        text: formatDistanceToNow(date, { addSuffix: true }), 
        subtext: "Qolgan vaqt", 
        isOverdue: false,
        icon: Clock
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) return null;

  const deadlineInfo = getDeadlineInfo();
  const DeadlineIcon = deadlineInfo.icon;

  // Construct group location from 'lat'/'lng' columns
  const groupLoc = (task.groups?.lat && task.groups?.lng)
      ? { lat: task.groups.lat, lng: task.groups.lng } 
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-semibold truncate">{task.groups?.name || 'Group Task'}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
        {/* Badges & Title */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant={task.type === 'homework' ? "default" : "secondary"} className="uppercase">
                {task.type === 'homework' ? "Uyga vazifa" : "Amaliyot"}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold leading-tight">
            {task.title}
          </h1>
          
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>O'qituvchi:</span>
            <span className="text-foreground font-medium">{task.profiles?.full_name || 'Instructor'}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border p-5 relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider ${deadlineInfo.isOverdue ? 'text-destructive' : 'text-primary'}`}>
                <DeadlineIcon className="w-4 h-4" />
                {deadlineInfo.subtext}
              </div>
              <div className="text-2xl font-bold mb-1">
                {deadlineInfo.text.replace('about ', '')}
              </div>
            </div>
            <DeadlineIcon className={`absolute -right-4 -bottom-4 w-24 h-24 rotate-12 opacity-5 ${deadlineInfo.isOverdue ? 'text-destructive' : 'text-primary'}`} />
          </Card>

          <Card className="bg-card border-border p-5 relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-purple-500 mb-2 font-bold text-xs uppercase tracking-wider">
                <Star className="w-4 h-4" />
                Baholash
              </div>
              <div className="text-2xl font-bold mb-1">
                {task.max_score || 10} Ball
              </div>
            </div>
            <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-purple-500/10 rotate-12" />
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-card border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold">Yo'riqnoma</h2>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <p>{task.description}</p>
          </div>
        </Card>

        {/* Resources */}
        {task.file_url && (
          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-sm text-muted-foreground">
               <Paperclip className="w-4 h-4" /> Ilova qilingan fayllar
            </h3>
            
            <Card 
              className="bg-card border-border p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors cursor-pointer group shadow-sm"
              onClick={() => {
                  const url = supabase.storage.from("tasks").getPublicUrl(task.file_url).data.publicUrl;
                  window.open(url, '_blank');
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">Topshiriq fayli</h4>
                <p className="text-xs text-muted-foreground">Ko'rish uchun bosing</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-20">
        <div className="max-w-3xl mx-auto">
          {submission ? (
            <Button 
              onClick={() => {
                 if (submission.score !== null) {
                   navigate(`/student-dashboard/tasks/${taskId}/result`);
                 } else {
                   setIsSubmitOpen(true);
                 }
              }}
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg"
              variant="outline"
            >
              {submission.score !== null ? 'Natijani ko\'rish' : 'Javobni ko\'rish'}
            </Button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSubmitOpen(true)}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 rotate-90" />
              </div>
              Javob yuborish
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
        taskType={task.type}
        taskDate={task.type === 'internship' ? task.date : undefined}
        groupLocation={groupLoc}
      />
    </div>
  );
}
