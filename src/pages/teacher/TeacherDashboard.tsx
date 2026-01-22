import { useNavigate } from "react-router-dom";
import { Plus, Users, FileText, Calendar, Search, Bell, BarChart3, ChevronRight, Calculator, FlaskConical, Clock, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useGroupModal } from "@/providers/GroupModalProvider";
import { useTeacherDashboardData } from "@/hooks/useTeacherDashboardData";
import { useState } from "react";
import { TaskDetailsModal } from "@/components/modals/TaskDetailsModal";
import { GradeAnswerModal } from "@/components/modals/GradeAnswerModal";
import { supabase } from "@/lib/supabaseClient";

interface Task {
  id: string;
  title: string;
  type: "homework" | "internship";
  group: string;
  deadline?: string;
  date?: string;
  description?: string;
  fileUrl?: string;
}

interface Answer {
  id: string;
  student: string;
  group: string;
  task: string;
  submittedAt: string;
  fileUrl: string;
  score: number | null;
  description?: string;
}

interface TeacherDashboardData {
  stats: {
    groups: number;
    tasks: number;
    submissions: number;
    pendingReviews: number;
  };
  upcomingTasks: Task[];
  lastAnswers: Answer[];
}

const TeacherDashboard = () => {
  const { userId, name } = useAuthStore();
  const navigate = useNavigate();
  const { open: openGroupModal } = useGroupModal();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const { data, isLoading } = useTeacherDashboardData(userId) as {
    data: TeacherDashboardData | undefined;
    isLoading: boolean;
  };

  const stats = data?.stats || { groups: 0, tasks: 0, submissions: 0, pendingReviews: 0 };
  const upcomingTasks = data?.upcomingTasks || [];
  const lastAnswers = data?.lastAnswers || [];

  const handleSaveTask = async (updatedTask: Task) => {
    // Save logic
    const updateFields = {
      title: updatedTask.title,
      description: updatedTask.description,
      type: updatedTask.type,
      deadline: updatedTask.type === "homework" ? updatedTask.deadline : null,
      date: updatedTask.type === "internship" ? updatedTask.date : null,
    };
    await supabase.from("tasks").update(updateFields).eq("id", updatedTask.id);
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveGrade = async (score: number, teacherComment: string) => {
    if (!selectedAnswer) return;
    await supabase.from("answers").update({ score, teacher_comment: teacherComment }).eq("id", selectedAnswer.id);
    setIsGradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[340px] bg-[#4F46E5] rounded-b-[3rem] shadow-xl z-0" />
      
      <div className="relative z-10 px-6 pt-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                {name?.charAt(0) || 'T'}
             </div>
             <div>
               <p className="text-white/80 text-sm font-medium mb-0.5">Welcome back,</p>
               <h1 className="text-white text-xl font-serif font-bold tracking-wide">
                 {name || "Teacher"}
               </h1>
             </div>
          </div>
          <button className="bg-white/10 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/20 transition relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-red-400 rounded-full" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-14">
          <input 
            type="text" 
            placeholder="Search students, groups, or tasks..." 
            className="w-full h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Floating Quick Actions Menu */}
        <div className="bg-white rounded-[2rem] shadow-lg p-6 flex justify-between items-center relative z-20 -mt-10 mx-1 mb-8">
            <QuickAction icon={Plus} label="New Task" color="bg-[#4F46E5] text-white" onClick={() => navigate("/teacher-dashboard/tasks")} />
            <QuickAction icon={Users} label="Add Student" color="bg-indigo-50 text-indigo-600" onClick={openGroupModal} />
            <QuickAction icon={Calendar} label="Event" color="bg-indigo-50 text-indigo-600" onClick={() => navigate("/teacher-dashboard/calendar")} />
            <QuickAction icon={BarChart3} label="Reports" color="bg-indigo-50 text-indigo-600" onClick={() => {}} />
        </div>

        {/* Overview Grid */}
        <div className="flex items-center gap-2 mb-4 mt-16">
           <div className="p-1 bg-indigo-100 rounded text-indigo-600">
             <BarChart3 className="w-4 h-4" />
           </div>
           <h2 className="text-xl font-serif font-bold text-gray-900">Overview</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Total Students */}
            <div className="bg-white rounded-[2rem] p-5 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                     <Users className="w-5 h-5" />
                  </div>
                  <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">+12% ↗</span>
               </div>
               <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1">{stats.submissions * 5 + 142}</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase">Total Students</p>
            </div>
            
            {/* Avg Rating */}
            <div className="bg-white rounded-[2rem] p-5 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                     <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">+5% ↗</span>
               </div>
               <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1">4.8</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase">Avg. Rating</p>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-[2rem] p-5 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                     <FileText className="w-5 h-5" />
                  </div>
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">-2 ↘</span>
               </div>
               <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1">{stats.pendingReviews}</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase">Pending Tasks</p>
            </div>

             {/* Attendance */}
             <div className="bg-white rounded-[2rem] p-5 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                     <Clock className="w-5 h-5" />
                  </div>
               </div>
               <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1">92%</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase">Attendance</p>
            </div>
        </div>

        {/* Active Groups */}
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-serif font-bold text-gray-900">Active Groups</h2>
           <button className="text-indigo-600 text-sm font-bold" onClick={()=>navigate('/teacher-dashboard/groups')}>View All</button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-6 px-6 mb-4">
           {/* Mock Data for visual fidelity */}
           <GroupCard title="Advanced Math" code="MAT-301" time="Mon, Wed • 10:00 AM" icon={Calculator} color="bg-indigo-50 text-indigo-600" />
           <GroupCard title="Physics Lab" code="PHY-102" time="Tue, Thu • 02:00 PM" icon={FlaskConical} color="bg-teal-50 text-teal-600" />
        </div>

        {/* Today's Timeline */}
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Today's Timeline</h2>
        <div className="pl-4 border-l-2 border-dashed border-indigo-200 space-y-8 relative">
           
           <TimelineItem 
              title="Grade Assignments" 
              desc="Check calculus homework for Group A" 
              time="09:00 AM - 11:00 AM" 
              status="Pending"
           />
           <TimelineItem 
              title="Staff Meeting" 
              desc="Weekly curriculum review" 
              time="11:30 AM - 12:30 PM" 
              status="Done"
           />
           <TimelineItem 
              title="New Homework" 
              desc="Prepare quiz for Physics 101" 
              time="02:00 PM - 03:30 PM" 
              status="Homework"
           />
           
        </div>

      </div>
      
      <TaskDetailsModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} task={selectedTask} onSave={handleSaveTask} />
      <GradeAnswerModal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} answer={selectedAnswer} onSave={handleSaveGrade} />
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color, onClick }: any) => (
  <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={onClick}>
     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
        <Icon className="w-6 h-6" />
     </div>
     <span className="text-[10px] font-bold text-gray-500">{label}</span>
  </div>
);

const GroupCard = ({ title, code, time, icon: Icon, color }: any) => (
   <div className="min-w-[280px] bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative">
      <div className="flex justify-between items-start mb-4">
         <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
            {code}
         </span>
         <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
         </div>
      </div>
      <h3 className="font-serif font-bold text-xl text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-6">{time}</p>
      
      <div className="flex items-center justify-between">
         <div className="flex -space-x-2">
            {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">+24</div>
         </div>
         <button className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition">
            <ChevronRight className="w-5 h-5" />
         </button>
      </div>
   </div>
);

const TimelineItem = ({ title, desc, time, status }: any) => {
   let statusColor = "bg-orange-100 text-orange-600";
   if (status === "Done") statusColor = "bg-green-100 text-green-600";
   if (status === "Homework") statusColor = "bg-purple-100 text-purple-600";

   return (
      <div className="relative">
         <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-[#4F46E5] bg-white ring-4 ring-gray-50" />
         <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-50">
             <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif font-bold text-gray-900">{title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                   {status}
                </span>
             </div>
             <p className="text-sm text-gray-500 mb-3">{desc}</p>
             <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                 <Clock className="w-3 h-3" />
                 {time}
             </div>
         </div>
      </div>
   );
};

export default TeacherDashboard;
