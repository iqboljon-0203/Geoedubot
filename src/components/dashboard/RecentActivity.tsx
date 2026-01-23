import { motion } from 'framer-motion';
import { 
  FileCheck, 
  UserPlus, 
  Calendar as CalendarIcon, 
  Bell,
  ChevronRight,
  PlusCircle,
  ClipboardList
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityItem } from '@/hooks/useTeacherDashboardData';

const activityIcons: Record<string, { icon: any; bg: string; color: string }> = {
  group_join: { icon: UserPlus, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600' },
  task_submit: { icon: FileCheck, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600' },
  new_group: { icon: PlusCircle, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600' },
  new_task: { icon: ClipboardList, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600' },
  // default
  default: { icon: Bell, bg: 'bg-zinc-100 dark:bg-zinc-800', color: 'text-zinc-600' }
};

interface RecentActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export const RecentActivity = ({ activities = [], isLoading }: RecentActivityProps) => {

  if (isLoading) {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3 animate-pulse" />
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
  }

  if (activities.length === 0) {
      return (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              No recent activity
          </div>
      );
  }

  return (
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const config = activityIcons[activity.type] || activityIcons.default;
          const { icon: Icon, bg, color } = config;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all cursor-pointer group"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                  {activity.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                  {activity.subtitle}
                </p>
              </div>

              {/* Time & Arrow */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-zinc-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          );
        })}
      </div>
  );
};

export default RecentActivity;
