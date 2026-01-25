import { motion } from 'framer-motion';
import { Calendar, MessageSquare, FileText, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onSchedule?: () => void;
  onMessage?: () => void;
  onReport?: () => void;
  onManage?: () => void;
}

export const QuickActions = ({
  onSchedule = () => {},
  onMessage = () => {},
  onReport = () => {},
  onManage = () => {},
}: QuickActionsProps) => {
  const { t } = useTranslation();
  
  const actions: QuickAction[] = [
    {
      id: 'schedule',
      label: t('dashboard.quick_actions.schedule'),
      icon: <Calendar className="w-6 h-6 text-white" aria-hidden="true" />,
      bg: 'bg-gradient-to-br from-primary to-blue-600',
      onClick: onSchedule,
    },
    {
      id: 'message',
      label: t('nav.answers'),
      icon: <MessageSquare className="w-6 h-6 text-foreground" aria-hidden="true" />,
      bg: 'bg-card border-2 border-border',
      onClick: onMessage,
    },
    {
      id: 'report',
      label: t('nav.tasks'),
      icon: <FileText className="w-6 h-6 text-foreground" aria-hidden="true" />,
      bg: 'bg-card border-2 border-border',
      onClick: onReport,
    },
    {
      id: 'manage',
      label: t('nav.settings'),
      icon: <Settings className="w-6 h-6 text-foreground" aria-hidden="true" />,
      bg: 'bg-card border-2 border-border',
      onClick: onManage,
    },
  ];

  return (
    <section aria-labelledby="quick-actions-title">
      <h3 id="quick-actions-title" className="text-lg font-bold text-foreground mb-4">
        {t('dashboard.quick_actions.title')}
      </h3>
      <div className="grid grid-cols-4 gap-3" role="group" aria-label={t('dashboard.quick_actions.title')}>
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl p-2"
            aria-label={action.label}
          >
            <div className={`w-16 h-16 rounded-2xl ${action.bg} flex items-center justify-center shadow-sm`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
