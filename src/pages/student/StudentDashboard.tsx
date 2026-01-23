import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Calendar, CheckCircle2, Users } from 'lucide-react';
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
  const { userId, name } = useAuthStore();
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
      'from-blue-600 to-cyan-600',
      'from-pink-600 to-purple-600',
      'from-yellow-600 to-orange-600',
      'from-green-600 to-emerald-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-zinc-400 text-sm mb-1">{t('common.welcome')},</p>
            <h1 className="text-2xl font-bold">{name || 'Student'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-zinc-900 relative"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center cursor-pointer"
            >
              <span className="text-white font-bold text-lg">
                {name?.charAt(0) || 'S'}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('dashboard.weekly_progress')}</h2>
              <span className="text-sm text-zinc-400">{currentDate}</span>
            </div>

            <div className="mb-4">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {progressPercentage}%
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-4">{t('dashboard.stats.completed_tasks')}</p>

              <ProgressBar
                percentage={progressPercentage}
                showPercentage={false}
                animated={true}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-zinc-400">
                  {stats.completedTasks}/{totalTasks} {t('tasks.done')}
                </span>
              </div>
              <span className="text-zinc-500">
                You're ahead of 70% of students
              </span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              onClick={() => navigate('/student-dashboard/tasks')}
              className="bg-zinc-900 border-zinc-800 p-6 cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">{t('dashboard.quick_actions.view_tasks')}</h3>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              onClick={() => navigate('/student-dashboard/calendar')}
              className="bg-zinc-900 border-zinc-800 p-6 cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-600/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">{t('dashboard.quick_actions.schedule')}</h3>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* My Groups */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t('dashboard.my_groups.title')}</h2>
          <Button
            variant="link"
            onClick={() => navigate('/student-dashboard/groups')}
            className="text-blue-500 hover:text-blue-400 p-0 h-auto"
          >
           {t('common.view_all')} →
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0 p-6 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {t('dashboard.my_groups.join_new')}
                  </h3>
                  <p className="text-sm text-white/80">
                    Find study partners and mentors
                  </p>
                </div>
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
          <div className="space-y-3">
            {groups.slice(0, 3).map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() =>
                    navigate(`/student-dashboard/groups/${group.id}`)
                  }
                  className="bg-zinc-900 border-zinc-800 p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGroupColor(
                        index
                      )} flex items-center justify-center flex-shrink-0`}
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
                      <p className="text-sm text-zinc-400 truncate">
                        {group.schedule || 'No schedule'}
                      </p>
                    </div>
                    <div className="text-right">
                      {group.memberCount && (
                        <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
                          <Users className="w-3 h-3" />
                          <span>{group.memberCount}</span>
                        </div>
                      )}
                      {group.nextTask && (
                        <p className="text-xs text-zinc-500 truncate max-w-[120px]">
                          Next: {group.nextTask}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
