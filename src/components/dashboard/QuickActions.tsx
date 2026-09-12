import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuickActionsProps {
  onAddTask?: () => void;
  onAddGroup?: () => void;
}

export const QuickActions = ({
  onAddTask = () => {},
  onAddGroup = () => {},
}: QuickActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 mt-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddTask}
        className="flex-1 bg-[#00A87A] text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,168,122,0.3)]"
      >
        <MapPin className="w-5 h-5" />
        + Geo-vazifa
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddGroup}
        className="flex-1 bg-white text-slate-900 py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 text-sm"
      >
        <Users className="w-5 h-5 text-[#00A87A]" />
        + Guruh ochish
      </motion.button>
    </div>
  );
};

export default QuickActions;
