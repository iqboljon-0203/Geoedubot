import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Calendar, CheckCircle2, Users, Settings, Moon, Sun, Globe, Laptop, BookOpen, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

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
  const { userId, name } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
      className="min-h-screen bg-background text-foreground pb-24"
      role="main"
      aria-labelledby="student-dashboard-title"
    >
      {/* Header */}
      <header className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm mb-1">{t('common.welcome')},</p>
            <h1 id="student-dashboard-title" className="text-2xl font-bold">
              {name || t('auth.student')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/profile')}
              aria-label="Sozlamalar"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              aria-label={t('accessibility.notifications')}
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" aria-hidden="true" />
            </Button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={t('accessibility.open_profile')}
            >
              <span className="text-white font-bold text-lg">
                {name?.charAt(0) || 'S'}
              </span>
            </button>
          </div>
        </div>

        {/* Weekly Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('dashboard.weekly_progress')}</h2>
              <span className="text-sm text-muted-foreground">{currentDate}</span>
            </div>

            <div className="mb-4">
              <div className="flex items-end gap-2 mb-2">
                <span 
                  className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                  aria-label={`${progressPercentage}% ${t('dashboard.stats.completed_tasks')}`}
                >
                  {progressPercentage}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t('dashboard.stats.completed_tasks')}</p>

              <ProgressBar
                percentage={progressPercentage}
                showPercentage={false}
                animated={true}
                aria-label={`${t('dashboard.weekly_progress')}: ${progressPercentage}%`}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
                <span className="text-muted-foreground">
                  {stats.completedTasks}/{totalTasks} {t('tasks.done')}
                </span>
              </div>
              <span className="text-muted-foreground text-xs">
                {t('dashboard.keep_going', 'Davom eting!')}
              </span>
            </div>
          </Card>
        </motion.div>
      </header>

      {/* Quick Actions */}
      <section className="px-4 sm:px-6 mb-6" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="sr-only">{t('dashboard.quick_actions.title')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <Card
              onClick={() => navigate('/student-dashboard/tasks')}
              className="bg-card border-border p-6 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary h-full flex flex-col items-center justify-center text-center"
              role="button"
              tabIndex={0}
              aria-label={t('dashboard.quick_actions.view_tasks')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/student-dashboard/tasks')}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-1">{t('dashboard.quick_actions.view_tasks')}</h3>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="h-full"
          >
            <Card
              onClick={() => navigate('/student-dashboard/calendar')}
              className="bg-card border-border p-6 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary h-full flex flex-col items-center justify-center text-center"
              role="button"
              tabIndex={0}
              aria-label={t('dashboard.quick_actions.schedule')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/student-dashboard/calendar')}
            >
              <div className="w-12 h-12 rounded-2xl bg-green-600/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-500" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-1">{t('dashboard.quick_actions.schedule')}</h3>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-full col-span-2 lg:col-span-1"
          >
            <Card
              onClick={() => navigate('/settings')}
              className="bg-card border-border p-6 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary h-full flex flex-col items-center justify-center text-center"
              role="button"
              tabIndex={0}
              aria-label={t('profile.settings', 'Sozlamalar')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/settings')}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-purple-500" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-1">{t('profile.settings', 'Sozlamalar')}</h3>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* My Groups */}
      <section className="px-4 sm:px-6" aria-labelledby="my-groups-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="my-groups-heading" className="text-xl font-bold">{t('dashboard.my_groups.title')}</h2>
          <Button
            variant="link"
            onClick={() => navigate('/student-dashboard/groups')}
            className="text-primary hover:text-primary/80 p-0 h-auto"
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
              className="bg-gradient-to-r from-primary to-cyan-600 border-0 p-6 cursor-pointer hover:opacity-90 transition-opacity"
              role="button"
              tabIndex={0}
              aria-label={t('dashboard.my_groups.join_new')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {t('dashboard.my_groups.join_new')}
                  </h3>
                  <p className="text-sm text-white/80">
                    {t('common.find_partners')}
                  </p>
                </div>
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3" role="list">
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
                  className="bg-card border-border p-4 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary"
                  role="button"
                  tabIndex={0}
                  aria-label={`${group.title} - ${group.schedule || t('common.no_schedule')}`}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/student-dashboard/groups/${group.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGroupColor(
                        index
                      )} flex items-center justify-center flex-shrink-0`}
                      aria-hidden="true"
                    >
                      <span className="text-2xl">{getGroupIcon(index)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{group.title}</h3>
                        {group.status && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              group.status === 'Active'
                                ? 'bg-green-600/20 text-green-500'
                                : group.status === 'Review'
                                ? 'bg-purple-600/20 text-purple-500'
                                : 'bg-yellow-600/20 text-yellow-500'
                            }`}
                          >
                            {group.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.schedule || t('common.no_schedule')}
                      </p>
                    </div>
                    <div className="text-right">
                      {group.memberCount && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Users className="w-3 h-3" aria-hidden="true" />
                          <span>{group.memberCount}</span>
                        </div>
                      )}
                      {group.nextTask && (
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {t('tasks.next')}: {group.nextTask}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>


    </div>
  );
};

export default StudentDashboard;
