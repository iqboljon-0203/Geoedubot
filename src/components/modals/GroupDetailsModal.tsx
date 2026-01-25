import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    title: string;
    description: string;
    location: { lat: number; lng: number; address: string } | null;
    members: number;
    createdAt: string;
    teacher: { name: string; avatar?: string };
  } | null;
  onAddTask: () => void;
}

export function GroupDetailsModal({ isOpen, onClose, group, onAddTask }: GroupDetailsModalProps) {
  const { t } = useTranslation();
  if (!group) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-0 bg-background rounded-3xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-foreground truncate">{group.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-base leading-relaxed">
            {group.description || t('groups.description_placeholder')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-4">
          <div className="space-y-3 bg-muted/30 rounded-2xl p-4 border border-border/50">
            {group.location && (
              <div className="flex items-start text-sm text-foreground/80">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                <span>{group.location.address}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-foreground/80">
              <Calendar className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
              <span>{t('common.created_at')}: {new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-foreground/80">
              <Users className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
              <span>{group.members} {t('groups.members')}</span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="flex items-center space-x-3 p-2">
            <Avatar className="h-12 w-12 border-2 border-primary/20 p-0.5">
              <AvatarImage src={group.teacher.avatar} className="rounded-full object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {group.teacher.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate text-lg leading-tight">{group.teacher.name}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                {t('tasks.instructor')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border mt-0">
          <Button 
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-bold shadow-lg" 
            onClick={onAddTask}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('dashboard.quick_actions.create_task')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
