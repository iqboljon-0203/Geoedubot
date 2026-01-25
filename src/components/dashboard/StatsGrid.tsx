import { motion } from 'framer-motion';
import { Users, FileText, GraduationCap, ClipboardList } from 'lucide-react';
import { DashboardStats } from '@/hooks/useTeacherDashboardData';
import { useTranslation } from 'react-i18next';

interface StatsGridProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  delay?: number;
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, iconBg, delay = 0, isLoading }: StatCardProps) => (
  <motion.article
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -4 }}
    className="bg-card rounded-3xl p-6 shadow-sm border border-border"
    aria-label={`${title}: ${value}`}
  >
    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`} aria-hidden="true">
      {icon}
    </div>
    {isLoading ? (
      <div className="h-9 w-24 bg-muted rounded-md animate-pulse mb-1 skeleton" role="status" aria-label="Loading" />
    ) : (
      <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
    )}
    <p className="text-sm text-muted-foreground">{title}</p>
  </motion.article>
);

export const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const { t } = useTranslation();
  return (
    <section aria-label={t('dashboard.stats.active_groups')}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list">
        <StatCard
          title={t('dashboard.stats.active_groups')}
          value={stats?.activeGroups || 0}
          icon={<Users className="w-6 h-6 text-primary" aria-hidden="true" />}
          iconBg="bg-primary/10"
          delay={0}
          isLoading={isLoading}
        />
        <StatCard
          title={t('dashboard.stats.pending_reviews')}
          value={stats?.pendingReviews || 0}
          icon={<FileText className="w-6 h-6 text-orange-600" aria-hidden="true" />}
          iconBg="bg-orange-500/10"
          delay={0.1}
          isLoading={isLoading}
        />
        <StatCard
          title={t('dashboard.stats.total_students')}
          value={stats?.totalStudents || 0}
          icon={<GraduationCap className="w-6 h-6 text-purple-600" aria-hidden="true" />}
          iconBg="bg-purple-500/10"
          delay={0.2}
          isLoading={isLoading}
        />
        <StatCard
          title={t('dashboard.stats.total_tasks')}
          value={stats?.totalTasks || 0}
          icon={<ClipboardList className="w-6 h-6 text-green-600" aria-hidden="true" />}
          iconBg="bg-green-500/10"
          delay={0.3}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default StatsGrid;
