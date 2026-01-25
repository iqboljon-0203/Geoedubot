import { motion } from 'framer-motion';
import { 
  FileCheck, 
  UserPlus, 
  Bell,
  ChevronRight,
  PlusCircle,
  ClipboardList
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uz, ru, enUS } from 'date-fns/locale';
import { ActivityItem } from '@/hooks/useTeacherDashboardData';
import { useTranslation } from 'react-i18next';

const activityIcons: Record<string, { icon: any; bg: string; color: string }> = {
  group_join: { icon: UserPlus, bg: 'bg-green-500/10', color: 'text-green-600' },
  task_submit: { icon: FileCheck, bg: 'bg-primary/10', color: 'text-primary' },
  new_group: { icon: PlusCircle, bg: 'bg-purple-500/10', color: 'text-purple-600' },
  new_task: { icon: ClipboardList, bg: 'bg-orange-500/10', color: 'text-orange-600' },
  // default
  default: { icon: Bell, bg: 'bg-muted', color: 'text-muted-foreground' }
};

// Locale mapping for date-fns
const dateLocales: Record<string, any> = {
  uz: uz,
  ru: ru,
  en: enUS
};

interface RecentActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export const RecentActivity = ({ activities = [], isLoading }: RecentActivityProps) => {
  const { t, i18n } = useTranslation();
  
  // Get current locale for date-fns
  const currentLocale = dateLocales[i18n.language] || enUS;

  // Format timestamp with localization
  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: currentLocale 
    });
  };

  if (isLoading) {
    return (
      <section aria-label={t('dashboard.recent_activity.title')}>
        <h3 id="recent-activity-title" className="text-lg font-bold text-foreground mb-4">
          {t('dashboard.recent_activity.title')}
        </h3>
        <div className="space-y-4" role="status" aria-label={t('common.loading')}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-muted rounded-2xl skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3 skeleton" />
                <div className="h-3 bg-muted rounded w-1/2 skeleton" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section aria-label={t('dashboard.recent_activity.title')}>
        <h3 id="recent-activity-title" className="text-lg font-bold text-foreground mb-4">
          {t('dashboard.recent_activity.title')}
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          {t('dashboard.recent_activity.no_activity')}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="recent-activity-title">
      <h3 id="recent-activity-title" className="text-lg font-bold text-foreground mb-4">
        {t('dashboard.recent_activity.title')}
      </h3>
      <div className="space-y-3" role="list">
        {activities.map((activity, index) => {
          const config = activityIcons[activity.type] || activityIcons.default;
          const { icon: Icon, bg, color } = config;
          
          // Get translated title using the titleKey
          const translatedTitle = t(activity.titleKey);
          
          return (
            <motion.article
              key={activity.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-4 p-4 rounded-2xl hover:bg-accent border border-transparent hover:border-border transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-primary"
              role="listitem"
              tabIndex={0}
              aria-label={`${translatedTitle} - ${activity.subtitle}`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                <Icon className={`w-6 h-6 ${color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {translatedTitle}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.subtitle}
                </p>
              </div>

              {/* Time & Arrow */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(activity.timestamp)}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default RecentActivity;
