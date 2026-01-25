import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Calendar, FileText, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useStudentTasks } from '@/hooks/useStudentTasks';
import { formatDistanceToNow, isPast, isValid, isToday } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function StudentTasks() {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  
  const { data: tasks = [], isLoading } = useStudentTasks(userId);

  // Filter tasks based on tab
  const filteredTasks = tasks.filter((task) => {
    const hasSubmitted = task.answers && task.answers.length > 0;
    return activeTab === 'todo' ? !hasSubmitted : hasSubmitted;
  });

  const getTaskDateInfo = (task: any) => {
    // Internship uses 'date', Homework uses 'deadline'
    const dateStr = task.type === 'internship' ? task.date : task.deadline;
    
    if (!dateStr) return { text: "Muddatsiz", isOverdue: false, isValid: false };
    
    const date = new Date(dateStr);
    const valid = isValid(date) && date.getFullYear() > 2000; // Filter out 1970 epoch bugs

    if (!valid) return { text: "Sana belgilanmagan", isOverdue: false, isValid: false };

    if (isToday(date)) {
        return { 
            text: "Bugun", 
            isOverdue: false, 
            isValid: true,
            dateObj: date
        };
    }

    if (isPast(date)) {
        return { 
            text: task.type === 'internship' ? "Yakunlangan" : "Muddati o'tgan", 
            isOverdue: true, 
            isValid: true,
            dateObj: date
        };
    }

    return { 
        text: formatDistanceToNow(date, { addSuffix: true }), 
        isOverdue: false, 
        isValid: true,
        dateObj: date
    };
  };

  return (
    <div 
      className="min-h-screen bg-background text-foreground pb-24"
      role="main"
      aria-labelledby="tasks-title"
    >
      {/* Header */}
      <header className="px-4 sm:px-6 py-6 sticky top-0 bg-background z-20 border-b border-border">
        <h1 id="tasks-title" className="text-2xl font-bold mb-6">{t('tasks.my_tasks')}</h1>

        {/* Custom Tabs */}
        <div className="bg-muted p-1 rounded-xl flex gap-1" role="tablist">
          <button
            onClick={() => setActiveTab('todo')}
            role="tab"
            aria-selected={activeTab === 'todo'}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'todo' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('tasks.todo', 'Bajarish kerak')}
          </button>
          <button
            onClick={() => setActiveTab('done')}
            role="tab"
            aria-selected={activeTab === 'done'}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'done' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('tasks.done', 'Bajarildi')}
          </button>
        </div>
      </header>

      {/* Task List */}
      <div className="px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-2xl" />
                ))}
             </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={activeTab === 'todo' ? Clock : CheckCircle2}
              title={activeTab === 'todo' ? t('tasks.pending') : t('tasks.done')}
              description={
                activeTab === 'todo'
                  ? "Sizda yangi vazifalar yo'q. Dam olish vaqti!"
                  : "Hali hech qanday vazifani bajarmadingiz."
              }
            />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              role="list"
            >
              {filteredTasks.map((task, index) => {
                const dateInfo = getTaskDateInfo(task);
                const hasSubmitted = task.answers && task.answers.length > 0;
                const score = hasSubmitted ? task.answers?.[0].score : null;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    role="listitem"
                  >
                    <Card
                      onClick={() => navigate(`/student-dashboard/tasks/${task.id}`)}
                      className="group bg-card border-border hover:border-primary/50 cursor-pointer overflow-hidden rounded-2xl transition-all hover:shadow-md"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                             <div className={cn("p-2 rounded-lg", 
                                task.type === 'homework' ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                             )}>
                                {task.type === 'homework' ? <FileText className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                             </div>
                             <div>
                                <h3 className="font-bold text-lg leading-none mb-1">{task.groups?.name || "Guruh"}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                    {task.type === 'homework' ? "Uyga vazifa" : "Amaliyot"}
                                  </Badge>
                                </div>
                             </div>
                          </div>
                          
                          {dateInfo.isOverdue && activeTab === 'todo' && (
                             <Badge variant="destructive" className="animate-in fade-in">
                                {dateInfo.text.toUpperCase()}
                             </Badge>
                          )}
                        </div>

                        <h4 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">
                           {task.title}
                        </h4>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                           {task.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className={dateInfo.isOverdue ? "text-red-500" : ""}>
                                 {dateInfo.isValid && dateInfo.dateObj 
                                    ? dateInfo.dateObj.toLocaleDateString() 
                                    : dateInfo.text}
                              </span>
                           </div>

                           <div>
                              {activeTab === 'done' ? (
                                <Badge variant={score ? "default" : "secondary"}>
                                   {score ? `${score}/10 ball` : "Baholanmoqda"}
                                </Badge>
                              ) : (
                                <Button size="sm" variant={dateInfo.isOverdue ? "secondary" : "default"} className="h-8 rounded-lg text-xs px-4">
                                   {dateInfo.isOverdue ? "Muddati o'tgan" : "Bajarish"}
                                </Button>
                              )}
                           </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
