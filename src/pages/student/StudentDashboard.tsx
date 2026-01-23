import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Bell,
  Plus,
  Flame
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";

interface Task {
  id: string;
  title: string;
  description?: string;
  type: "homework" | "internship";
  deadline?: string;
  date?: string;
  group?: string;
  hasSubmitted?: boolean;
  score?: number | null;
}

interface StudentDashboardData {
  stats: {
    completedTasks: number;
    pendingTasks: number;
    averageScore: number;
  };
  recentTasks: Task[];
  groups: any[];
}

const StudentDashboard = () => {
  const { userId, name } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useStudentDashboardData(userId) as {
    data: StudentDashboardData | undefined;
    isLoading: boolean;
    error: unknown;
  };

  const stats = data?.stats || {
    completedTasks: 0,
    pendingTasks: 0,
    averageScore: 0,
  };

  const recentTasks = data?.recentTasks || [];

  const getTaskStatus = (task: Task) => {
    if (task.hasSubmitted && task.score !== null && task.score !== undefined) {
      return "done";
    }
    
    const taskDate = task.type === "homework" ? task.deadline : task.date;
    if (!taskDate) return "upcoming";
    
    const dueDate = new Date(taskDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 2 && !task.hasSubmitted) {
      return "due_soon";
    }
    
    return "upcoming";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      due_soon: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "DUE SOON",
      },
      done: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "DONE",
      },
      upcoming: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "UPCOMING",
      },
    };
    const badge = badges[status as keyof typeof badges] || badges.upcoming;
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} whitespace-nowrap`}>
        {badge.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === "due_soon") {
      return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">⏰</span>
      </div>;
    }
    if (status === "done") {
      return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">✅</span>
      </div>;
    }
    return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
      <span className="text-2xl">📚</span>
    </div>;
  };

  // Calculate progress percentage
  const totalTasks = stats.completedTasks + stats.pendingTasks;
  const progressPercentage = totalTasks > 0 
    ? Math.round((stats.completedTasks / totalTasks) * 100) 
    : 0;

  // Mock streak for now (can be calculated from submission dates later)
  const streakDays = 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {name?.charAt(0) || "W"}
                </span>
                <div className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white -bottom-0.5 -right-0.5"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">LEVEL 12</p>
                <h1 className="text-lg font-bold text-gray-900">{name || "Student"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Course Progress</h2>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="font-bold text-orange-500 whitespace-nowrap">{streakDays} Day Streak</span>
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className="text-4xl sm:text-5xl font-bold text-gray-900">{progressPercentage}</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-400 mb-1">%</div>
          </div>
          <div className="mb-3 sm:mb-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <span className="truncate mr-2">Progress through your courses</span>
            <span className="whitespace-nowrap">
              {totalTasks > 0 ? `${stats.pendingTasks} tasks remaining` : 'No tasks yet'}
            </span>
          </div>
        </div>

        {/* Current Quests */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-xl font-bold text-gray-900">CURRENT QUESTS</h2>
            <button 
              onClick={() => navigate("/student-dashboard/tasks")}
              className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm whitespace-nowrap"
            >
              View All
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Hali topshiriq yo'q</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {recentTasks.slice(0, 5).map((task) => {
                const status = getTaskStatus(task);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/student-dashboard/tasks/${task.id}`)}
                  >
                    {getStatusIcon(status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{task.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {task.description || (task.type === "homework" ? "Uyga vazifa" : "Amaliyot")}
                      </p>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.completedTasks}</div>
            <div className="text-xs sm:text-sm text-gray-600">Completed Tasks</div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.pendingTasks}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending Tasks</div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : "N/A"}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Average Score</div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => navigate("/student-dashboard/groups")}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
