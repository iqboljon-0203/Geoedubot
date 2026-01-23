import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  barClassName?: string;
  animated?: boolean;
}

export const ProgressBar = ({
  percentage,
  label,
  showPercentage = true,
  className,
  barClassName,
  animated = true,
}: ProgressBarProps) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayPercentage(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {Math.round(displayPercentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayPercentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: 'easeOut',
          }}
          className={cn(
            'h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full',
            barClassName
          )}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
