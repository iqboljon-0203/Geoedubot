import { motion } from 'framer-motion';
import { Calendar, MessageSquare, FileText, Settings } from 'lucide-react';

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
  const actions: QuickAction[] = [
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="w-6 h-6 text-white" />,
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      onClick: onSchedule,
    },
    {
      id: 'message',
      label: 'Message',
      icon: <MessageSquare className="w-6 h-6 text-zinc-700" />,
      bg: 'bg-white border-2 border-zinc-200',
      onClick: onMessage,
    },
    {
      id: 'report',
      label: 'Report',
      icon: <FileText className="w-6 h-6 text-zinc-700" />,
      bg: 'bg-white border-2 border-zinc-200',
      onClick: onReport,
    },
    {
      id: 'manage',
      label: 'Manage',
      icon: <Settings className="w-6 h-6 text-zinc-700" />,
      bg: 'bg-white border-2 border-zinc-200',
      onClick: onManage,
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-zinc-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-16 h-16 rounded-2xl ${action.bg} flex items-center justify-center shadow-sm`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-zinc-700">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
