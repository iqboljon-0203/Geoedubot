import { useState, useEffect } from "react";
import { AdaptiveDrawer } from "@/components/ui/AdaptiveDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Ensure this component exists or use styled textarea
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { 
  User, 
  Users, 
  FileText, 
  Calendar, 
  Download, 
  Star, 
  MessageSquare,
  FileIcon,
  CheckCircle,
  ExternalLink
} from "lucide-react";

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
  const { t } = useTranslation();
  const [score, setScore] = useState<number | string>(answer?.score ?? "");
  const [teacherComment, setTeacherComment] = useState<string>(
    answer?.teacher_comment ?? ""
  );

  useEffect(() => {
    if (isOpen && answer) {
      setScore(answer.score ?? "");
      setTeacherComment(answer.teacher_comment ?? "");
    }
  }, [answer, isOpen]);

  if (!answer) return null;

  // Fayl uchun public URL olish
  const getPublicUrl = (filePath: string) => {
    if (!filePath) return null;
    const { data } = supabase.storage.from("answers").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const publicFileUrl = getPublicUrl(answer.fileUrl);

  const handleScoreChange = (val: string) => {
    if (val === "") {
      setScore("");
      return;
    }
    const numVal = Number(val);
    if (numVal >= 0 && numVal <= 10) {
      setScore(numVal);
    }
  };

  return (
    <AdaptiveDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('grading.grade_submission')}
      className=""
    >
      <div className="space-y-6">
        {/* Student Info Card */}
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/60">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{answer.student}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{answer.group}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block flex items-center gap-1">
                <FileText className="w-3 h-3" /> {t('tasks.title')}
              </span>
              <p className="font-medium truncate">{answer.task}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {t('grading.submitted')}
              </span>
              <p className="font-medium">{answer.submittedAt}</p>
            </div>
          </div>
        </div>

        {/* Student's Answer Content */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
            {t('grading.submitted')}
          </Label>
          
          {/* Description Bubble */}
          {(answer.description && answer.description !== "EMPTY") || !publicFileUrl ? (
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/20">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {answer.description && answer.description !== "EMPTY" ? answer.description : t('grading.no_description')}
              </p>
            </div>
          ) : null}

          {/* File Attachment Card */}
          {publicFileUrl && (
            <a
              href={publicFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-3 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{t('grading.submitted_file')}</p>
                <p className="text-xs text-muted-foreground">{t('grading.download_file')}</p>
              </div>
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          )}
        </div>

        {/* Grading Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {t('grading.score')}
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={score}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    className="w-full text-center text-lg font-bold h-12 rounded-xl border-border focus:ring-primary pl-4 pr-4"
                    placeholder="0"
                  />
                </div>
                <span className="text-muted-foreground font-medium whitespace-nowrap">/ 10 ball</span>
              </div>
              {/* Visual Score Indicator */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full transition-all duration-500 ${
                    !score ? 'bg-transparent' :
                    Number(score) >= 8 ? 'bg-green-500' : 
                    Number(score) >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((Number(score) || 0) * 10, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                {t('grading.feedback')}
              </Label>
              <Textarea
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                placeholder={t('grading.feedback_placeholder')}
                className="min-h-[100px] rounded-xl resize-none border-border focus:ring-primary p-3"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            onClick={() => onSave(Number(score) || 0, teacherComment)}
            className="w-full h-12 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {t('grading.submit_grade')}
          </Button>
        </div>
      </div>
    </AdaptiveDrawer>
  );
}
