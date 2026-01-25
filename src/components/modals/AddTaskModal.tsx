import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FileText, Calendar, Upload, Loader2, Save, X } from "lucide-react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  group: { id: string; title: string } | null;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  group,
}: AddTaskModalProps) {
  const { t } = useTranslation();
  const { userId } = useAuthStore();
  const [type, setType] = useState<"homework" | "internship">("homework");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [practiceDay, setPracticeDay] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const handleSubmit = async () => {
    if (!group || !userId) return;
    if (
      !title ||
      !desc ||
      (type === "homework" && !deadline) ||
      (type === "internship" && !practiceDay)
    ) {
      toast.error(t('common.fill_all_fields'));
      return;
    }

    let fileUrl = null;
    if (file) {
      setFileUploading(true);
      const { data, error } = await supabase.storage
        .from("tasks")
        .upload(`${userId}/${Date.now()}_${file.name}`, file);
      
      if (error) {
        setFileUploading(false);
        toast.error(t('tasks.create.error') + ": " + error.message);
        return;
      }
      fileUrl = data.path;
    }

    const payload: {
      title: string;
      description: string;
      type: "homework" | "internship";
      group_id: string;
      file_url: string | null;
      created_by: string;
      deadline: string | null;
      date: string | null;
    } = {
      title,
      description: desc,
      type,
      group_id: group.id,
      file_url: fileUrl,
      created_by: userId,
      deadline: type === "homework" ? deadline : null,
      date: type === "internship" ? practiceDay : null,
    };

    const { error } = await supabase.from("tasks").insert([payload]);
    setFileUploading(false);
    
    if (error) {
      toast.error(t('tasks.create.error') + ": " + error.message);
      return;
    }

    toast.success(t('tasks.create.success'));
    onSubmit && onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDesc("");
    setDeadline("");
    setPracticeDay("");
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] w-full max-h-[90vh] overflow-y-auto p-0 border-0 bg-background rounded-3xl shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t('tasks.create.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-base">
            {group
              ? t('tasks.create.subtitle', { group: group.title })
              : t('groups.select_group')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Type Selection */}
          <div className="flex gap-2 p-1 bg-muted rounded-2xl">
            <button
              onClick={() => setType("homework")}
              className={`flex-1 py-3 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 ${
                type === "homework" 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              <FileText className="w-4 h-4" />
              {t('tasks.create.homework')}
            </button>
            <button
              onClick={() => setType("internship")}
              className={`flex-1 py-3 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 ${
                type === "internship" 
                  ? "bg-green-600 text-white shadow-lg" 
                  : "text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              <Calendar className="w-4 h-4" />
              {t('tasks.create.internship')}
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                {t('tasks.create.task_title')}
              </Label>
              <Input 
                id="task-title"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder={t('tasks.create.title_placeholder')}
                className="h-12 rounded-2xl border-border bg-background focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-desc" className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                {t('tasks.create.description')}
              </Label>
              <Textarea 
                id="task-desc"
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                placeholder={t('tasks.create.description_placeholder')}
                className="min-h-[120px] rounded-2xl border-border bg-background focus:ring-1 focus:ring-primary resize-none p-4 shadow-sm"
              />
            </div>

            {/* Date Selection */}
            {type === "homework" ? (
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('tasks.create.deadline')}
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-12 rounded-2xl border-border bg-background focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="practice-day" className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('tasks.internship_day')}
                </Label>
                <Input
                  id="practice-day"
                  type="date"
                  value={practiceDay}
                  onChange={(e) => setPracticeDay(e.target.value)}
                  className="h-12 rounded-2xl border-border bg-background focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                {t('tasks.create.attachment')}
              </Label>
              <div className="relative group">
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full min-h-[100px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-background hover:bg-muted/50 transition-all cursor-pointer p-4"
                >
                  {file ? (
                    <div className="flex items-center gap-3 w-full px-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium text-center px-4">
                        {t('modals.submit.upload_title')}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border mt-0">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1 h-12 rounded-2xl border-border font-semibold"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={fileUploading} 
              className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-bold shadow-lg"
            >
              {fileUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
 