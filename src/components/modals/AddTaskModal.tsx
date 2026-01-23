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
  const { userId } = useAuthStore();
  const [type, setType] = useState<"homework" | "amaliyot">("homework");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [practiceDay, setPracticeDay] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const handleSubmit = async () => {
    if (!group) return;
    if (
      !title ||
      !desc ||
      (type === "homework" && !deadline) ||
      (type === "amaliyot" && !practiceDay)
    )
      return;
    let fileUrl = null;
    if (file) {
      setFileUploading(true);
      const { data, error } = await supabase.storage
        .from("tasks")
        .upload(`${userId}/${Date.now()}_${file.name}`, file);
      setFileUploading(false);
      if (error) {
        alert("Fayl yuklashda xatolik: " + error.message);
        return;
      }
      fileUrl = data.path;
    }
    // Supabase tasks jadvaliga yozish
    const payload: any = {
      title,
      description: desc,
      type: type === "amaliyot" ? "internship" : "homework",
      group_id: group.id,
      file_url: fileUrl,
      created_by: userId,
      deadline: type === "homework" ? deadline : null,
      date: type === "amaliyot" ? practiceDay : null,
    };
    const { error } = await supabase.from("tasks").insert([payload]);
    if (error) {
      alert("Topshiriq qo'shishda xatolik: " + error.message);
      return;
    }
    onSubmit && onSubmit(payload);
    onClose();
    setTitle("");
    setDesc("");
    setDeadline("");
    setPracticeDay("");
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Yangi topshiriq qo'shish</DialogTitle>
          <DialogDescription>
            {group
              ? `${group.title} uchun yangi topshiriq biriktiring`
              : "Guruh tanlanmagan"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <Button
            variant={type === "homework" ? "default" : "outline"}
            onClick={() => setType("homework")}
            type="button"
          >
            Uyga vazifa
          </Button>
          <Button
            variant={type === "amaliyot" ? "default" : "outline"}
            onClick={() => setType("amaliyot")}
            type="button"
          >
            Amaliyot
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Vazifa nomi</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <Label>Vazifa tavsifi</Label>
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
          {type === "homework" && (
            <>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </>
          )}
          {type === "amaliyot" && (
            <>
              <Label>Amaliyot kuni</Label>
              <Input
                type="date"
                value={practiceDay}
                onChange={(e) => setPracticeDay(e.target.value)}
              />
            </>
          )}
          <Label>Fayl yuklash</Label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={fileUploading}>
            {fileUploading ? "Yuklanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
 