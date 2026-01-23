import { motion } from 'framer-motion';
import { Users, FileText, GraduationCap, ClipboardList } from 'lucide-react';
import { DashboardStats } from '@/hooks/useTeacherDashboardData';
import { useTranslation } from 'react-i18next';

interface StatsGridProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, iconBg, delay = 0, isLoading }: any) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -4 }}
    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800"
  >
    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    {isLoading ? (
      <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse mb-1" />
    ) : (
      <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{value}</h3>
    )}
    <p className="text-sm text-zinc-600 dark:text-zinc-400">{title}</p>
  </motion.div>
);

export const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t('dashboard.stats.active_groups')}
        value={stats?.activeGroups || 0}
        icon={<Users className="w-6 h-6 text-blue-600" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        delay={0}
        isLoading={isLoading}
      />
      <StatCard
        title={t('dashboard.stats.pending_reviews')}
        value={stats?.pendingReviews || 0}
        icon={<FileText className="w-6 h-6 text-orange-600" />}
        iconBg="bg-orange-100 dark:bg-orange-900/30"
        delay={0.1}
        isLoading={isLoading}
      />
      <StatCard
        title={t('dashboard.stats.total_students')}
        value={stats?.totalStudents || 0}
        icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
        iconBg="bg-purple-100 dark:bg-purple-900/30"
        delay={0.2}
        isLoading={isLoading}
      />
      <StatCard
        title={t('dashboard.stats.total_tasks')}
        value={stats?.totalTasks || 0}
        icon={<ClipboardList className="w-6 h-6 text-green-600" />}
        iconBg="bg-green-100 dark:bg-green-900/30"
        delay={0.3}
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatsGrid;
