import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AdaptiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * AdaptiveDrawer - Responsive modal component
 * Mobile: Bottom sheet (Sheet)
 * Desktop: Centered dialog (Dialog)
 */
export const AdaptiveDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: AdaptiveDrawerProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className={`rounded-t-3xl max-h-[90vh] overflow-y-auto ${className}`}
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-2xl rounded-3xl ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default AdaptiveDrawer;
