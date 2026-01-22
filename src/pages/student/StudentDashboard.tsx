import { useNavigate } from "react-router-dom";
import { Bell, Trophy, BookOpen, Clock, ChevronRight, CheckCircle2, FileText, ArrowRight, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabaseClient";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";

interface Task {
  type: "homework" | "internship";
  id: string;
  title: string;
  deadline?: string;
  date?: string;
  status: string;
  group: string;
}

interface LastAnswer {
  id: string;
  taskTitle: string;
  group: string;
  date: string;
  file_url?: string;
}

interface StudentDashboardData {
  stats: { completed: number; pending: number; upcomingInternships: number };
  upcomingTasks: Task[];
  lastAnswers: LastAnswer[];
}

const StudentDashboard = () => {
  const { name, userId } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useStudentDashboardData(userId) as {
    data: StudentDashboardData | undefined;
    isLoading: boolean;
  };
  
  const upcomingTasks = data?.upcomingTasks || [];
  const lastAnswers = data?.lastAnswers || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative overflow-hidden font-sans">
      {/* Deep Purple Header */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-[#4F46E5] rounded-b-[3rem] shadow-xl z-0" />
      
      <div className="relative z-10 px-6 pt-10">
        {/* Header Content */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-lg">
                {name?.charAt(0) || 'S'}
             </div>
             <div>
               <p className="text-white/80 text-sm font-medium mb-0.5">Good morning,</p>
               <h1 className="text-white text-2xl font-serif font-bold tracking-wide leading-tight max-w-[200px]">
                 {name || "Student"}
               </h1>
             </div>
          </div>
          <button className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition shadow-inner relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-400 rounded-full border-2 border-[#4F46E5]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search tasks, courses..." 
            className="w-full h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
        </div>

        {/* Stats Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           {/* GPA Card */}
           <div className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Trophy className="w-5 h-5" />
                 </div>
                 <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                    +0.2 ↗
                 </span>
              </div>
              <div>
                 <h3 className="text-3xl font-serif font-bold text-gray-900 leading-none mb-1">3.85</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current GPA</p>
              </div>
           </div>

           {/* Active Courses Card */}
           <div className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                 <BookOpen className="w-5 h-5" />
              </div>
              <div className="mt-auto">
                 <h3 className="text-3xl font-serif font-bold text-gray-900 leading-none mb-1">6</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Courses</p>
              </div>
           </div>

           {/* Attendance Card */}
           <div className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col items-center justify-center text-center gap-1">
              <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-0.5 rounded mb-2">95%</span>
              <h3 className="text-2xl font-serif font-bold text-gray-900">95%</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Attendance</p>
           </div>

           {/* Study Time Card */}
           <div className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col items-center justify-center text-center gap-1">
               <span className="text-teal-600 font-bold text-sm bg-teal-50 px-2 py-0.5 rounded mb-2">72%</span>
               <h3 className="text-2xl font-serif font-bold text-gray-900">124h</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Study Time</p>
           </div>
        </div>

        {/* Upcoming Tasks Title */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            Upcoming Tasks
          </h2>
          <button className="text-indigo-500 text-xs font-bold uppercase tracking-wider hover:underline" onClick={() => navigate('/student-dashboard/tasks')}>
             View Schedule
          </button>
        </div>

        {/* Horizontal Tasks List */}
        <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-6 px-6 mb-2">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <div key={task.id} className="min-w-[280px] bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative group active:scale-95 transition-transform duration-200">
                 <div className="flex justify-between items-start mb-4">
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Pending
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      Due Tomorrow
                    </span>
                 </div>
                 
                 <h3 className="font-serif font-bold text-xl text-gray-900 mb-2 leading-tight">
                    {task.title}
                 </h3>
                 <p className="text-xs text-gray-500 mb-6 line-clamp-2">
                   Chapter 4: Integration by parts and substitutions.
                 </p>
                 
                 <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <BookOpen className="w-4 h-4" />
                       </div>
                       <span className="text-xs font-bold text-gray-700">{task.group}</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-teal-400 text-white flex items-center justify-center shadow-lg shadow-teal-200 group-hover:bg-teal-500 transition-colors">
                       <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))
          ) : (
            <div className="min-w-full text-center py-10 bg-white rounded-[2rem] text-gray-400 text-sm">
               No upcoming tasks.
            </div>
          )}
        </div>

        {/* Recent Activity Title */}
        <h2 className="text-xl font-serif font-bold text-gray-800 mb-4">Recent Activity</h2>
        
        {/* Recent Activity List */}
        <div className="space-y-4 mb-8">
           {lastAnswers.length > 0 ? (
               lastAnswers.map((ans) => (
                 <div key={ans.id} className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-center mb-1">
                          <h4 className="font-serif font-bold text-gray-900 truncate">Task Submitted</h4>
                          <span className="text-[10px] text-gray-400 font-medium">2h ago</span>
                       </div>
                       <p className="text-xs text-gray-500 truncate">
                          You submitted <span className="text-green-600 font-bold">{ans.taskTitle}</span>
                       </p>
                    </div>
                 </div>
               ))
           ) : (
             <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-50 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 flex-shrink-0">
                    <Trophy className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                       <h4 className="font-serif font-bold text-gray-900">Welcome!</h4>
                       <span className="text-[10px] text-gray-400 font-medium">Just now</span>
                    </div>
                    <p className="text-xs text-gray-500">
                       Start your journey by joining a group.
                    </p>
                 </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
