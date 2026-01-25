import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden group',
        className
      )}
    >
      {/* Decorative background gradients */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />

      <motion.div 
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20"
      >
        <Icon className="w-12 h-12 text-primary" />
        
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-3xl bg-primary/20 animate-ping opacity-25" />
      </motion.div>

      <div className="relative z-10">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto mb-8 leading-relaxed">
          {description}
        </p>
        
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="rounded-full px-8 py-6 h-auto text-base font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 text-white border-0"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
