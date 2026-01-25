import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Calendar, CheckCircle2, Users, Settings, BookOpen, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'homework' | 'internship';
  deadline?: string;
  date?: string;
  group?: string;
  hasSubmitted?: boolean;
  score?: number | null;
}

interface Group {
  id: string;
  title: string;
  schedule?: string;
  status?: string;
  nextTask?: string;
  memberCount?: number;
}

interface StudentDashboardData {
  stats: {
    completedTasks: number;
    pendingTasks: number;
    averageScore: number;
  };
  recentTasks: Task[];
  groups: Group[];
}

const StudentDashboard = () => {
  const { userId, name, profileUrl } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading } = useStudentDashboardData(userId) as {
    data: StudentDashboardData | undefined;
    isLoading: boolean;
    error: unknown;
  };

  const stats = data?.stats || {
    completedTasks: 0,
    pendingTasks: 0,
    averageScore: 0,
  };

  const groups = data?.groups || [];

  // Calculate progress percentage
  const totalTasks = stats.completedTasks + stats.pendingTasks;
  const progressPercentage =
    totalTasks > 0 ? Math.round((stats.completedTasks / totalTasks) * 100) : 0;

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const getGroupIcon = (index: number) => {
    const icons = ['💻', '🎨', '💾', '💬'];
    return icons[index % icons.length];
  };

  const getGroupColor = (index: number) => {
    const colors = [
      'from-primary to-cyan-600',
      'from-pink-600 to-purple-600',
      'from-yellow-600 to-orange-600',
      'from-green-600 to-emerald-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div 
      className="p-0"
      role="main"
      aria-labelledby="student-dashboard-title"
    >
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between">
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
                  id="student-dashboard-title"
                  className="text-base sm:text-xl font-bold text-foreground leading-tight"
                >
                  {name || t('auth.student')}
                </h1>
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {t('dashboard.student_dashboard', 'Talaba Paneli')}
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 sm:w-12 sm:h-12 rounded-full relative bg-background/50 hover:bg-background border-border/50 shadow-sm"
                  aria-label={t('accessibility.notifications')}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/80" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" aria-hidden="true" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="hidden sm:block"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-background/50 hover:bg-background border-border/50 shadow-sm"
                  onClick={() => navigate('/settings')}
                  aria-label={t('nav.settings')}
                >
                  <Settings className="w-5 h-5 text-foreground/80" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Weekly Progress Card - Reduced size on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-lg font-semibold">{t('dashboard.weekly_progress')}</h2>
              <span className="text-[10px] sm:text-sm text-muted-foreground">{currentDate}</span>
            </div>

            <div className="mb-3 sm:mb-4">
              <div className="flex items-end gap-2 mb-1 sm:mb-2">
                <span 
                  className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                  aria-label={`${progressPercentage}% ${t('dashboard.stats.completed_tasks')}`}
                >
                  {progressPercentage}%
                </span>
              </div>
              <p className="text-[10px] sm:text-sm text-muted-foreground mb-3 sm:mb-4">{t('dashboard.stats.completed_tasks')}</p>

              <ProgressBar
                percentage={progressPercentage}
                showPercentage={false}
                animated={true}
                aria-label={`${t('dashboard.weekly_progress')}: ${progressPercentage}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 h-4 text-green-500" aria-hidden="true" />
                <span className="text-muted-foreground">
                  {stats.completedTasks}/{totalTasks} {t('tasks.done')}
                </span>
              </div>
              <span className="text-muted-foreground text-[10px] sm:text-xs">
                {t('dashboard.keep_going', 'Davom eting!')}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions - Smaller Cards on Mobile */}
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="sr-only">{t('dashboard.quick_actions.title')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                onClick={() => navigate('/student-dashboard/tasks')}
                className="bg-card border-border p-3 sm:p-6 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary flex flex-col items-center justify-center text-center shadow-sm"
                role="button"
                tabIndex={0}
                aria-label={t('dashboard.quick_actions.view_tasks')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/student-dashboard/tasks')}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-4">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xs sm:text-base font-semibold">{t('dashboard.quick_actions.view_tasks')}</h3>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Card
                onClick={() => navigate('/student-dashboard/calendar')}
                className="bg-card border-border p-3 sm:p-6 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary flex flex-col items-center justify-center text-center shadow-sm"
                role="button"
                tabIndex={0}
                aria-label={t('dashboard.quick_actions.schedule')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/student-dashboard/calendar')}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/10 flex items-center justify-center mb-2 sm:mb-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" aria-hidden="true" />
                </div>
                <h3 className="text-xs sm:text-base font-semibold">{t('dashboard.quick_actions.schedule')}</h3>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="col-span-2 lg:col-span-1"
            >
              <Card
                onClick={() => navigate('/settings')}
                className="bg-card border-border p-3 sm:p-6 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary flex flex-col items-center justify-center text-center shadow-sm"
                role="button"
                tabIndex={0}
                aria-label={t('profile.settings', 'Sozlamalar')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/settings')}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-500/10 flex items-center justify-center mb-2 sm:mb-4">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" aria-hidden="true" />
                </div>
                <h3 className="text-xs sm:text-base font-semibold">{t('profile.settings', 'Sozlamalar')}</h3>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* My Groups Section */}
        <section aria-labelledby="my-groups-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="my-groups-heading" className="text-lg sm:text-xl font-bold">{t('dashboard.my_groups.title')}</h2>
            <Button
              variant="link"
              onClick={() => navigate('/student-dashboard/groups')}
              className="text-primary hover:text-primary/80 p-0 h-auto text-xs sm:text-sm"
            >
              {t('common.view_all')} →
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12" role="status" aria-label={t('common.loading')}>
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : groups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card 
                onClick={() => navigate('/student-dashboard/groups')}
                className="bg-gradient-to-r from-primary to-cyan-600 border-0 p-4 sm:p-6 cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                role="button"
                tabIndex={0}
                aria-label={t('dashboard.my_groups.join_new')}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1">
                      {t('dashboard.my_groups.join_new')}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-white/80">
                      {t('common.find_partners')}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-white" />
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-2 sm:space-y-3" role="list">
              {groups.slice(0, 3).map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  role="listitem"
                >
                  <Card
                    onClick={() =>
                      navigate(`/student-dashboard/groups/${group.id}`)
                    }
                    className="bg-card border-border p-3 sm:p-4 cursor-pointer hover:bg-accent transition-colors shadow-sm"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/student-dashboard/groups/${group.id}`)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${getGroupColor(
                          index
                        )} flex items-center justify-center flex-shrink-0`}
                        aria-hidden="true"
                      >
                        <span className="text-xl sm:text-2xl">{getGroupIcon(index)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                          <h3 className="text-sm sm:text-base font-semibold truncate">{group.title}</h3>
                          {group.status && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                                group.status === 'Active'
                                  ? 'bg-green-500/10 text-green-500'
                                  : group.status === 'Review'
                                  ? 'bg-purple-500/10 text-purple-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }`}
                            >
                              {group.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                          {group.schedule || t('common.no_schedule')}
                        </p>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/50" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export default StudentDashboard;
