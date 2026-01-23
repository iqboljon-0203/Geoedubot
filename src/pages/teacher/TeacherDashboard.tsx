import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { Button } from '@/components/ui/button';

const TeacherDashboard = () => {
  const { name, profileUrl, userId } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useTeacherDashboardData(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 dark:from-black dark:to-zinc-900 pb-20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  alt={name || 'Teacher'}
                  className="w-14 h-14 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {name?.charAt(0).toUpperCase() || 'T'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {name || 'Instructor'}
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Teacher Dashboard</p>
              </div>
            </motion.div>

            {/* Notification Button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
            >
              <Bell className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <StatsGrid
          stats={dashboardData?.stats}
          isLoading={isLoading}
        />

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <QuickActions />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <RecentActivity 
            activities={dashboardData?.recentActivity} 
            isLoading={isLoading} 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
