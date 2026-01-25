import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useStudentGrades } from "@/hooks/useStudentGrades";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, XCircle, FileText, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function StudentGrades() {
  const { userId } = useAuthStore();
  const { data: rawAnswers, isLoading, error } = useStudentGrades(userId);
  const answers = Array.isArray(rawAnswers) ? rawAnswers : [];
  const navigate = useNavigate();
  const { t } = useTranslation();

  function getGradeBadge(grade: number | null) {
    if (grade === null) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 px-3 py-1 text-sm rounded-full font-medium gap-1">
          <Clock className="w-3 h-3" /> {t('grades.not_graded')}
        </Badge>
      );
    }
    if (grade >= 8) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1 text-sm rounded-full font-medium gap-1">
          <CheckCircle2 className="w-3 h-3" /> {grade} / 10
        </Badge>
      );
    }
    if (grade >= 5) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 px-3 py-1 text-sm rounded-full font-medium gap-1">
          <AlertTriangle className="w-3 h-3" /> {grade} / 10
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 text-sm rounded-full font-medium gap-1">
        <XCircle className="w-3 h-3" /> {grade} / 10
      </Badge>
    );
  }

  return (
    <div className="p-0">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">{t('grades.all_submissions')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('common.error')}
            </h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('grades.no_submissions_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('grades.no_submissions_desc')}
            </p>
          </div>
        ) : (
          answers.map((task) => (
            <Card
              key={task.id}
              className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 leading-tight">
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>📁 {task.group}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-lg px-2.5 py-0.5",
                            task.type === "homework"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          )}
                        >
                          {task.type === "homework" ? t('tasks.homework') : t('tasks.internship')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 pl-16 md:pl-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('tasks.score')}
                  </span>
                  {getGradeBadge(task.grade)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    {t('grades.your_desc')}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {task.studentDesc && task.studentDesc !== "EMPTY" ? (
                      task.studentDesc
                    ) : (
                      <span className="text-muted-foreground italic">{t('grades.no_desc')}</span>
                    )}
                  </p>
                </div>

                {task.teacherComment && task.teacherComment !== "EMPTY" && (
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {t('grades.teacher_comment')}
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {task.teacherComment}
                    </p>
                  </div>
                )}

                {task.answer && (
                  <div className="pt-2">
                    <a
                      href={
                        supabase.storage
                          .from("answers")
                          .getPublicUrl(task.answer).data.publicUrl
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-medium text-secondary-foreground transition-colors group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Download className="w-4 h-4" />
                      </div>
                      {t('grades.download_answer')}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
