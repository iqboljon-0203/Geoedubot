import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { GradeAnswerModal } from "@/components/modals/GradeAnswerModal";
import { useTeacherAnswersData } from "@/hooks/useTeacherAnswersData";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface Answer {
  id: string;
  student: string;
  group: string;
  task: string;
  submittedAt: string;
  fileUrl: string;
  score: number | null;
  description: string;
  teacher_comment: string;
}

export default function TeacherAnswers() {
  const queryClient = useQueryClient();
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: answers = [],
    isLoading,
    error,
  } = useTeacherAnswersData(userId) as {
    data: Answer[] | undefined;
    isLoading: boolean;
    error: unknown;
  };
  
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const handleOpenGrade = (answer: Answer) => {
    setSelectedAnswer(answer);
    setIsGradeModalOpen(true);
  };

  const handleCloseGrade = () => {
    setIsGradeModalOpen(false);
    setSelectedAnswer(null);
  };

  const handleSaveGrade = async (score: number, teacherComment: string) => {
    if (!selectedAnswer) return;
    
    try {
      const { error } = await supabase
        .from("answers")
        .update({ score, teacher_comment: teacherComment })
        .eq("id", selectedAnswer.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('grading.graded_successfully'),
      });
      
      // Invalidate the query to refetch the teacher's answers data, ensuring the UI is up-to-date.
      setIsGradeModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["teacher-answers-data", userId] }); 
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="p-0"
      role="main"
      aria-labelledby="answers-title"
    >
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-accent rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('common.back')}
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 id="answers-title" className="text-xl font-bold text-foreground">{t('nav.answers')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="text-center py-16" role="status" aria-label={t('common.loading')}>
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-destructive">
              {t('common.error')}: {typeof error === "object" && error && "message" in error
                ? (error as { message?: string }).message
                : String(error)}
            </p>
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
              <FileText className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('dashboard.recent_activity.no_activity')}
            </h3>
            <p className="text-muted-foreground">
              {t('tasks.pending')}
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="list">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="bg-card rounded-3xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-primary"
                onClick={() => handleOpenGrade(answer)}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenGrade(answer)}
                aria-label={`${answer.student} - ${answer.task}`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="text-lg font-bold text-primary">
                      {answer.student.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{answer.student}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {answer.group} • {answer.task}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('grading.submitted')}: {answer.submittedAt}
                    </p>
                    {answer.description && answer.description !== "EMPTY" && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {answer.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    {answer.score !== null ? (
                      <>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 whitespace-nowrap">
                          {answer.score} / 10
                        </span>
                        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                          {t('tasks.done')}
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 whitespace-nowrap">
                        {t('dashboard.stats.pending_reviews')}
                      </span>
                    )}
                    
                    <Button
                      size="sm"
                      variant={answer.score !== null ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenGrade(answer);
                      }}
                      className="w-full sm:w-auto"
                    >
                      {answer.score !== null ? t('common.edit') : t('grading.title')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GradeAnswerModal
        isOpen={isGradeModalOpen}
        onClose={handleCloseGrade}
        answer={selectedAnswer}
        onSave={handleSaveGrade}
      />
    </div>
  );
}
