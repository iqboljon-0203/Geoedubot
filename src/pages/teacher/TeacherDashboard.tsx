import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const TeacherDashboard = () => {
  const { name, profileUrl, userId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: dashboardData, isLoading } = useTeacherDashboardData(userId);

  return (
    <div 
      className="p-0"
      role="main"
      aria-labelledby="dashboard-title"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Profile Section */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={name || t('auth.teacher')}
                  className="w-14 h-14 rounded-full object-cover shadow-md"
                />
              ) : (
                <div 
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center text-white text-xl font-bold shadow-md"
                  aria-hidden="true"
                >
                  {name?.charAt(0).toUpperCase() || 'T'}
                </div>
              )}
              <div>
                <h1 
                  id="dashboard-title"
                  className="text-xl font-bold text-foreground"
                >
                  {name || t('auth.teacher')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.teacher_dashboard')}
                </p>
              </div>
            </motion.div>

            {/* Notification Button */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
                aria-label={t('accessibility.notifications')}
              >
                <Bell className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <StatsGrid
          stats={dashboardData?.stats}
          isLoading={isLoading}
        />

        {/* Quick Actions */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          aria-labelledby="quick-actions-title"
        >
          <QuickActions 
            onSchedule={() => navigate('/teacher-dashboard/calendar')}
            onMessage={() => navigate('/teacher-dashboard/answers')}
            onReport={() => navigate('/teacher-dashboard/tasks')}
            onManage={() => navigate('/settings')}
          />
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          aria-labelledby="recent-activity-title"
        >
          <RecentActivity 
            activities={dashboardData?.recentActivity} 
            isLoading={isLoading} 
          />
        </motion.section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
