import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { GradeAnswerModal } from "@/components/modals/GradeAnswerModal";
import { useTeacherAnswersData } from "@/hooks/useTeacherAnswersData";
import { supabase } from "@/lib/supabaseClient";

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
  const { userId } = useAuthStore();
  const navigate = useNavigate();
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
    await supabase
      .from("answers")
      .update({ score, teacher_comment: teacherComment })
      .eq("id", selectedAnswer.id);
    setIsGradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Barcha javoblar</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-red-600">
              Xatolik: {typeof error === "object" && error && "message" in error
                ? (error as { message?: string }).message
                : String(error)}
            </p>
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hali javob yuborilmagan
            </h3>
            <p className="text-gray-600">
              Talabalar javob yuborishni kutmoqda
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleOpenGrade(answer)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-blue-600">
                      {answer.student.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{answer.student}</h3>
                    <p className="text-sm text-gray-600 truncate">
                      {answer.group} • {answer.task}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Yuborilgan: {answer.submittedAt}
                    </p>
                    {answer.description && answer.description !== "EMPTY" && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {answer.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    {answer.score !== null ? (
                      <>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                          {answer.score} / 10
                        </span>
                        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Completed
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 whitespace-nowrap">
                        Needs Review
                      </span>
                    )}
                    
                    <Button
                      size="sm"
                      variant={answer.score !== null ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenGrade(answer);
                      }}
                      className="hidden sm:block"
                    >
                      {answer.score !== null ? "Tahrirlash" : "Baholash"}
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
