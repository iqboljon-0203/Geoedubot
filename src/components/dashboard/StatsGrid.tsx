import { motion } from 'framer-motion';
import { Users, Hourglass, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/hooks/useTeacherDashboardData';
import { useTranslation } from 'react-i18next';

interface StatsGridProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Groups Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            Faol
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 leading-none mb-1">
            {isLoading ? '-' : (stats?.activeGroups || 0)}
          </div>
          <div className="text-xs text-slate-500">Guruhlar</div>
        </div>
      </motion.div>

      {/* New Answers Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Hourglass className="w-4 h-4" />
          </div>
          {(stats?.pendingReviews || 0) > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1 mr-1"></span>
          )}
        </div>
        <div className="relative z-10">
          <div className="text-2xl font-bold text-slate-900 leading-none mb-1">
            {isLoading ? '-' : (stats?.pendingReviews || 0)}
          </div>
          <div className="text-xs text-slate-500">Yangi javob</div>
        </div>
      </motion.div>

      {/* Progress/Students Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="w-8 h-8 rounded-xl bg-green-50 text-[#00A87A] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 leading-none mb-1">
            {isLoading ? '-' : (stats?.totalStudents || 0)}
          </div>
          <div className="text-[11px] text-slate-500 truncate">Talabalar</div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsGrid;
