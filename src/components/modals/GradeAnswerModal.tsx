import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

interface GradeAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  answer: {
    id: string;
    student: string;
    group: string;
    task: string;
    submittedAt: string;
    fileUrl: string;
    score: number | null;
    description?: string;
    teacher_comment?: string;
  } | null;
  onSave: (score: number, teacherComment: string) => void;
}

export function GradeAnswerModal({
  isOpen,
  onClose,
  answer,
  onSave,
}: GradeAnswerModalProps) {
  const [score, setScore] = useState<number | string>(answer?.score ?? "");
  const [teacherComment, setTeacherComment] = useState<string>(
    answer?.teacher_comment ?? ""
  );

  useEffect(() => {
    setScore(answer?.score ?? ""); // 0 emas, bo'sh string agar null bo'lsa
    setTeacherComment(answer?.teacher_comment ?? "");
  }, [answer, isOpen]);

  if (!answer) return null;

  // Fayl uchun public URL olish
  const getPublicUrl = (filePath: string) => {
    if (!filePath) return null;
    return supabase.storage.from("answers").getPublicUrl(filePath).data
      .publicUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Javobni baholash</DialogTitle>
          <DialogDescription>
            Student yuborgan javobni 0-10 ballik tizimda baholang.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {/* ... (existing fields) */}
          <div>
            <b>Student:</b> {answer.student}
          </div>
          <div>
            <b>Guruh:</b> {answer.group}
          </div>
          <div>
            <b>Topshiriq:</b> {answer.task}
          </div>
          <div>
            <b>Yuborilgan sana:</b> {answer.submittedAt}
          </div>
          <div>
            <b>Javob tavsifi:</b>{" "}
            {typeof answer.description === "string" &&
            answer.description.trim() &&
            answer.description !== "EMPTY" ? (
              answer.description
            ) : (
              <span className="text-muted-foreground">Tavsif yo'q</span>
            )}
          </div>
          <div>
            <b>Fayl:</b>{" "}
            {answer.fileUrl ? (
              <a
                href={getPublicUrl(answer.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Yuklab olish
              </a>
            ) : (
              <span className="text-muted-foreground">Fayl yo'q</span>
            )}
          </div>
          <Label>Baho (0-10)</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={score}
            onChange={(e) => {
                const val = e.target.value;
                if (val === "") setScore("");
                else setScore(Number(val));
            }}
          />
          <Label>Izoh (studentga tavsif)</Label>
          <textarea
            className="w-full border rounded p-2"
            value={teacherComment}
            onChange={(e) => setTeacherComment(e.target.value)}
            placeholder="Studentga izoh..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(Number(score) || 0, teacherComment)}>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
