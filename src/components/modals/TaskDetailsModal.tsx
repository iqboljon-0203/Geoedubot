import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, X, Upload, FileText, Calendar, Users, Tag, AlignLeft, Download, Save, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  type: "homework" | "internship";
  group: string;
  deadline?: string;
  practiceDay?: string;
  desc?: string;
  fileUrl?: string;
}

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (task: Task) => void;
}

export function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  onSave,
}: TaskDetailsModalProps) {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(task);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setEditTask(task);
    setIsEdit(false);
  }, [task, isOpen]);

  if (!task) return null;

  const handleChange = (field: keyof Task, value: any) => {
    if (!editTask) return;
    setEditTask({ ...editTask, [field]: value });
  };

  const getShortFileName = (url: string) => {
    const fileName = url.split('/').pop() || "";
    if (fileName.length > 25) {
      return fileName.substring(0, 15) + "..." + fileName.slice(-7);
    }
    return fileName;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editTask) return;

    setIsUploading(true);
    try {
      const { data, error } = await supabase.storage
        .from('tasks')
        .upload(`${Date.now()}_${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('tasks')
        .getPublicUrl(data.path);

      setEditTask({ ...editTask, fileUrl: publicUrl });
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error(t('tasks.create.error') + ": " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    if (!editTask) return;
    setEditTask({ ...editTask, fileUrl: undefined });
  };

  const handleSave = () => {
    if (editTask) {
      onSave(editTask);
      setIsEdit(false);
      toast.success(t('common.success'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[550px] w-[95vw] max-h-[85vh] overflow-y-auto p-0 border-0 bg-background rounded-3xl shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isEdit ? <Edit2 className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
            {isEdit ? t('tasks.edit_title') : t('tasks.details')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            {isEdit
              ? t('tasks.create.subtitle', { group: task.group })
              : t('tasks.view_desc', { defaultValue: "Vazifa tafsilotlarini ko'rish" })}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {isEdit ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">{t('tasks.create.task_title')}</Label>
                <Input
                  value={editTask?.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="h-12 rounded-2xl border-border bg-background shadow-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">{t('tasks.create.description')}</Label>
                <Textarea
                  value={editTask?.desc || ""}
                  onChange={(e) => handleChange("desc", e.target.value)}
                  className="min-h-[120px] rounded-2xl border-border bg-background resize-none p-4 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {editTask?.type === "homework" ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">{t('tasks.create.deadline')}</Label>
                    <Input
                      type="date"
                      value={editTask.deadline || ""}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      className="h-12 rounded-2xl border-border bg-background shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">{t('tasks.internship_day')}</Label>
                    <Input
                      type="date"
                      value={editTask?.practiceDay || ""}
                      onChange={(e) => handleChange("practiceDay", e.target.value)}
                      className="h-12 rounded-2xl border-border bg-background shadow-sm"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                 <Label className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">{t('tasks.create.attachment')}</Label>
                 {editTask?.fileUrl ? (
                   <div className="flex items-center justify-between p-3 border rounded-2xl bg-muted/30 group">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-foreground truncate">
                           {getShortFileName(editTask.fileUrl)}
                         </p>
                       </div>
                     </div>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                       onClick={handleRemoveFile}
                     >
                       <X className="w-4 h-4" />
                     </Button>
                   </div>
                 ) : (
                   <div className="relative">
                     <input
                       type="file"
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       onChange={handleFileUpload}
                       disabled={isUploading}
                     />
                     <div className="flex flex-col items-center justify-center w-full min-h-[100px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background hover:bg-muted/50 transition-all p-4">
                       {isUploading ? (
                         <Loader2 className="w-8 h-8 animate-spin text-primary" />
                       ) : (
                         <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                       )}
                       <span className="text-sm text-muted-foreground font-medium">
                         {isUploading ? t('common.loading') : t('modals.submit.upload_title')}
                       </span>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">
                  {task.title}
                </h3>
                <div className="flex gap-3 text-sm text-foreground/80 bg-muted/30 p-4 rounded-2xl border border-border/50">
                   <AlignLeft className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                   <p className="whitespace-pre-wrap leading-relaxed">{task.desc || t('tasks.no_description')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/50">
                   <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                     <Tag className="w-3.5 h-3.5" />
                     {t('tasks.create.type')}
                   </div>
                   <p className="font-semibold text-foreground mt-1">
                     {task.type === "homework" ? t('tasks.create.homework') : t('tasks.create.internship')}
                   </p>
                 </div>

                 <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/50">
                   <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                     <Users className="w-3.5 h-3.5" />
                     {t('nav.groups')}
                   </div>
                   <p className="font-semibold text-foreground mt-1">{task.group}</p>
                 </div>

                 {(task.deadline || task.practiceDay) && (
                   <div className="space-y-1.5 p-4 rounded-2xl bg-muted/20 border border-border/50 col-span-2">
                     <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                       <Calendar className="w-3.5 h-3.5" />
                       {task.type === "homework" ? t('tasks.create.deadline') : t('tasks.internship_day')}
                     </div>
                     <p className="font-semibold text-foreground mt-1 text-lg">
                       {task.deadline || task.practiceDay}
                     </p>
                   </div>
                 )}
              </div>

              {task.fileUrl && (
                <div className="space-y-2">
                   <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                     {t('tasks.create.attachment')}
                   </Label>
                   <a
                     href={task.fileUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center justify-between p-4 border border-border rounded-2xl bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group shadow-sm"
                   >
                     <div className="flex items-center gap-4 overflow-hidden">
                       <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                           {getShortFileName(task.fileUrl)}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {t('grading.download_file')}
                         </p>
                       </div>
                     </div>
                     <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                   </a>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border mt-2">
          {isEdit ? (
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setIsEdit(false)}
                className="flex-1 h-12 rounded-2xl border-border font-semibold shadow-sm"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleSave}
                className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-bold shadow-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {t('common.save')}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setIsEdit(true)}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-bold"
            >
              <Edit2 className="w-5 h-5 mr-2" />
              {t('common.edit')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
