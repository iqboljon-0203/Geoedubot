import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Calendar, FileText, MapPin, Bell, Settings, ArrowRight } from 'lucide-react';
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
  const { userId, name, profileUrl } = useAuthStore();
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
    const valid = isValid(date) && date.getFullYear() > 2000;

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
      className="p-0"
      role="main"
      aria-labelledby="tasks-title"
    >
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {/* Profile Section */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={name || t('auth.student')}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover shadow-md border-2 border-background"
                />
              ) : (
                <div 
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-base sm:text-xl font-bold shadow-md"
                  aria-hidden="true"
                >
                  {name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}
              <div>
                <h1 
                  id="tasks-title"
                  className="text-base sm:text-xl font-bold text-foreground leading-tight"
                >
                  {t('tasks.my_tasks')}
                </h1>
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {name}
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full relative bg-background/50 hover:bg-background border-border/50 shadow-sm"
                aria-label={t('accessibility.notifications')}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Premium Animated Tabs */}
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl relative" role="tablist">
            <button
              onClick={() => setActiveTab('todo')}
              role="tab"
              aria-selected={activeTab === 'todo'}
              className={cn(
                "flex-1 relative z-10 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300",
                activeTab === 'todo' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === 'todo' && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-20 flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t('tasks.todo', 'Bajarish kerak')}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('done')}
              role="tab"
              aria-selected={activeTab === 'done'}
              className={cn(
                "flex-1 relative z-10 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300",
                activeTab === 'done' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === 'done' && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-20 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t('tasks.done', 'Bajarildi')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Task List Content Area */}
      <div className="p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="h-32 bg-card border-border animate-pulse rounded-2xl overflow-hidden">
                    <div className="h-full w-2 bg-muted/20" />
                  </Card>
                ))}
             </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={activeTab === 'todo' ? Clock : CheckCircle2}
                title={activeTab === 'todo' ? "Kutilmoqda" : "Bajarildi"}
                description={
                  activeTab === 'todo'
                    ? "Sizda yangi vazifalar yo'q. Dam olish vaqti!"
                    : "Hali hech qanday vazifani bajarmadingiz."
                }
              />
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
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
                      className="group relative bg-card border-border hover:border-primary/50 cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-sm"
                    >
                      {/* Left indicator stripe */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                        task.type === 'homework' ? "bg-blue-500" : "bg-orange-500"
                      )} />
                      
                      <div className="p-4 sm:p-5 pl-5 sm:pl-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", 
                                task.type === 'homework' ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                             )}>
                                {task.type === 'homework' ? <FileText className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                             </div>
                             <div className="min-w-0">
                                <h3 className="font-bold text-sm sm:text-base leading-tight mb-0.5 truncate pr-2">
                                  {task.groups?.name || "Guruh"}
                                </h3>
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4.5 font-bold uppercase tracking-wider bg-background/50">
                                  {task.type === 'homework' ? "Uyga vazifa" : "Amaliyot"}
                                </Badge>
                             </div>
                          </div>
                          
                          {dateInfo.isOverdue && activeTab === 'todo' && (
                             <Badge variant="destructive" className="animate-in fade-in slide-in-from-right-2 text-[9px] sm:text-[10px] font-bold">
                                {dateInfo.text.toUpperCase()}
                             </Badge>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                           {task.title}
                        </h4>
                        
                        <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                           {task.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                           <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground font-bold">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className={cn(dateInfo.isOverdue && activeTab === 'todo' ? "text-destructive" : "")}>
                                 {dateInfo.isValid && dateInfo.dateObj 
                                    ? dateInfo.dateObj.toLocaleDateString() 
                                    : dateInfo.text}
                              </span>
                           </div>

                           <div className="flex items-center gap-2">
                              {activeTab === 'done' ? (
                                <Badge variant={score ? "default" : "secondary"} className="h-7 sm:h-8 rounded-lg font-bold">
                                   {score ? `${score}/10 ball` : "Baholanmoqda"}
                                </Badge>
                              ) : (
                                <Button size="sm" variant={dateInfo.isOverdue ? "secondary" : "default"} className="h-7 sm:h-8 rounded-lg text-[10px] sm:text-xs px-3 sm:px-4 font-bold border-0 bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20 hover:opacity-90">
                                   {dateInfo.isOverdue ? "Muddati o'tgan" : "Bajarish"}
                                   <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
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
