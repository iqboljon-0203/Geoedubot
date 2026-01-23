import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { GradeAnswerModal } from "@/components/modals/GradeAnswerModal";
import { useTeacherAnswersData } from "@/hooks/useTeacherAnswersData";

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
  const { userId } = useAuthStore(); // ustoz id
  const {
    data: answers = [],
    isLoading,
    error,
  } = useTeacherAnswersData(userId) as {
    data: Answer[] | undefined;
    isLoading: boolean;
    error: unknown;
  };
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  // Baholash
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
    // Supabase answers jadvalida score va teacher_comment ni yangilash
    await supabase
      .from("answers")
      .update({ score, teacher_comment: teacherComment })
      .eq("id", selectedAnswer.id);
    setIsGradeModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Barcha javoblar</h1>
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Yuklanmoqda...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Xatolik:{" "}
            {typeof error === "object" && error && "message" in error
              ? (error as { message?: string }).message
              : String(error)}
          </div>
        ) : answers.length === 0 ? (
          <div className="text-muted-foreground">Hali javob yuborilmagan</div>
        ) : (
          answers.map((answer) => (
            <div
              key={answer.id}
              className="border border-border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-muted/50 transition"
              onClick={() => handleOpenGrade(answer)}
            >
              <div>
                <div className="font-medium">{answer.student}</div>
                <div className="text-sm text-muted-foreground">
                  {answer.group} • {answer.task}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Yuborilgan: {answer.submittedAt}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {answer.description && answer.description !== "EMPTY" ? (
                    answer.description
                  ) : (
                    <span className="text-muted-foreground">Tavsif yo'q</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {answer.score !== null ? (
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                    {answer.score} / 10
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">
                    Baholanmagan
                  </span>
                )}
                <Button
                  size="sm"
                  variant={answer.score !== null ? "outline" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenGrade(answer);
                  }}
                >
                  {answer.score !== null ? "Tahrirlash" : "Baholash"}
                </Button>
              </div>
            </div>
          ))
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
