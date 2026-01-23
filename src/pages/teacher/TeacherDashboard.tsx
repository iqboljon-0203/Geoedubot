import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp,
  Settings,
  Bell,
  Plus,
  ArrowRight,
  Star
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useGroupModal } from "@/providers/GroupModalProvider";
import { GradeAnswerModal } from "@/components/modals/GradeAnswerModal";
import { supabase } from "@/lib/supabaseClient";
import { useTeacherDashboardData } from "@/hooks/useTeacherDashboardData";
import { Button } from "@/components/ui/button";

interface Answer {
  id: string;
  student: string;
  group: string;
  task: string;
  submittedAt: string;
  fileUrl: string;
  score: number | null;
  description?: string;
  teacher_comment?: string;
}

interface TeacherDashboardData {
  stats: {
    groups: number;
    tasks: number;
    submissions: number;
    pendingReviews: number;
  };
  upcomingTasks: any[];
  lastAnswers: Answer[];
}

const TeacherDashboard = () => {
  const { userId, name } = useAuthStore();
  const navigate = useNavigate();
  const { open } = useGroupModal();
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const { data, isLoading } = useTeacherDashboardData(userId) as {
    data: TeacherDashboardData | undefined;
    isLoading: boolean;
    error: unknown;
  };

  const stats = data?.stats || {
    groups: 0,
    tasks: 0,
    submissions: 0,
    pendingReviews: 0,
  };
  const lastAnswers = data?.lastAnswers || [];

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
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {name?.charAt(0) || "W"}
                </span>
                <div className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white -bottom-0.5 -right-0.5"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Welcome back,</p>
                <h1 className="text-lg font-bold text-gray-900">{name || "Teacher"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Active Groups */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stats.groups}</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Groups</div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stats.pendingReviews}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending Reviews</div>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stats.submissions}</div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-wrap">
              <span className="text-green-600 font-medium flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                📈 +12%
              </span>
              <span className="text-gray-600">Total Students</span>
            </div>
          </div>

          {/* Avg Score */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">94.2</div>
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Avg. Score</div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Submissions</h2>
            <button 
              onClick={() => navigate("/teacher-dashboard/answers")}
              className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : lastAnswers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Hali javob yuborilmagan</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {lastAnswers.slice(0, 4).map((answer) => (
                <div
                  key={answer.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => handleOpenGrade(answer)}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg font-bold text-blue-600">
                      {answer.student.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{answer.student}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{answer.task}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    {answer.score !== null ? (
                      <>
                        <div className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                          {answer.score} / 10
                        </div>
                        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
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
                      {answer.score !== null ? "View" : "Grade"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={open}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <GradeAnswerModal
        isOpen={isGradeModalOpen}
        onClose={handleCloseGrade}
        answer={selectedAnswer}
        onSave={handleSaveGrade}
      />
    </div>
  );
};

export default TeacherDashboard;
