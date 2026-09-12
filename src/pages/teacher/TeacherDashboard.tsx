import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { useTranslation } from 'react-i18next';

const TeacherDashboard = () => {
  const { name, profileUrl, userId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: dashboardData, isLoading } = useTeacherDashboardData(userId);

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen font-['Outfit']">
      
      {/* Header */}
      <header className="pt-8 px-4 pb-4">
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#5CE3A1] text-[#006644] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                O'qituvchi
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A87A]"></span>
                Geografiya kafedrasi dotsenti
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight max-w-[240px]">
              Xayrli kun, {name || 'Ustoz'}!
            </h1>
          </motion.div>

          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative w-12 h-12 rounded-full bg-[#EEF5F1] flex items-center justify-center hover:bg-[#E1EFE7] transition-colors"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5 text-[#006C4A]" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-[#EEF5F1] rounded-full"></span>
          </motion.button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 space-y-6">
        
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
        >
          <QuickActions 
            onAddTask={() => navigate('/teacher-dashboard/tasks/new')}
            onAddGroup={() => navigate('/teacher-dashboard/groups/new')}
          />
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
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
