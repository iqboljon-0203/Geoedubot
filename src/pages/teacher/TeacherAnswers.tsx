import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { GradeAnswerModal } from "@/components/modals/GradeAnswerModal";
import { useTeacherAnswersData } from "@/hooks/useTeacherAnswersData";
import { CheckCircle2, Clock, FileText, User } from "lucide-react";

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
  const {
    data: answers = [],
    isLoading,
  } = useTeacherAnswersData(userId) as {
    data: Answer[] | undefined;
    isLoading: boolean;
  };
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const handleOpenGrade = (answer: Answer) => {
    setSelectedAnswer(answer);
    setIsGradeModalOpen(true);
  };
  const handleSaveGrade = async (score: number, teacherComment: string) => {
    if (!selectedAnswer) return;
    await supabase.from("answers").update({ score, teacher_comment: teacherComment }).eq("id", selectedAnswer.id);
    setIsGradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-primary-gradient h-48 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0 content-['']" />

      <div className="relative z-10 pt-8 px-6">
        <div className="flex justify-between items-center mb-8 text-white">
          <div>
            <h1 className="text-3xl font-black">Submissions</h1>
            <p className="opacity-80 text-sm font-medium">Review and grade student work</p>
          </div>
        </div>

        <div className="space-y-4 pb-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">Loading submissions...</div>
          ) : answers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-[2rem] shadow-soft">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                 <FileText className="w-8 h-8" />
               </div>
               <h3 className="text-gray-900 font-bold mb-1">No Submissions</h3>
               <p className="text-gray-500 text-sm">Students haven't submitted any work yet.</p>
            </div>
          ) : (
            answers.map((answer) => (
              <div
                key={answer.id}
                className="card-modern bg-white p-5 flex items-start gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                onClick={() => handleOpenGrade(answer)}
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800 truncate pr-2">{answer.student}</h3>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${answer.score !== null ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {answer.score !== null ? `Score: ${answer.score}` : 'Pending'}
                      </span>
                   </div>
                   
                   <p className="text-xs text-muted-foreground font-medium mb-1">
                     {answer.task} <span className="text-gray-300 mx-1">•</span> {answer.group}
                   </p>
                   
                   <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-2">
                     <Clock className="w-3 h-3" /> Submitted {answer.submittedAt}
                   </p>

                   {answer.description && answer.description !== "EMPTY" && (
                     <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 italic border border-gray-100">
                       "{answer.description}"
                     </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <GradeAnswerModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        answer={selectedAnswer}
        onSave={handleSaveGrade}
      />
    </div>
  );
}
