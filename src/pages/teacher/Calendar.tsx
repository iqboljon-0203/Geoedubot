import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";

export interface GroupType {
  id: string;
  name: string;
}
export interface TaskType {
  id: string;
  title: string;
  deadline?: string;
  date?: string;
  type: string;
  description: string;
  group_id: string;
}

export default function TeacherCalendar() {
  const today = new Date();
  const { userId } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<any>(today);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupsAndTasks = async () => {
      setLoading(true);
      if (!userId) return;
      const { data: groupData } = await supabase.from("groups").select("id, name").eq("created_by", userId);
      setGroups((groupData as GroupType[]) || []);
      
      if (groupData && groupData.length > 0) {
        const groupIds = (groupData as GroupType[]).map((g) => g.id);
        const { data: taskData } = await supabase.from("tasks").select("*, group_id").in("group_id", groupIds);
        setTasks((taskData as TaskType[]) || []);
      } else {
        setTasks([]);
      }
      setLoading(false);
    };
    fetchGroupsAndTasks();
  }, [userId]);

  const filteredTasks = tasks.filter((task) => {
    const taskDate = task.deadline || task.date;
    if (!taskDate || !selectedDate) return false;
    const d1 = new Date(taskDate);
    return (
      d1.getFullYear() === selectedDate.getFullYear() &&
      d1.getMonth() === selectedDate.getMonth() &&
      d1.getDate() === selectedDate.getDate()
    );
  });

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-primary-gradient h-48 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0 content-['']" />

      <div className="relative z-10 pt-8 px-6">
         <div className="flex justify-between items-center mb-6 text-white">
            <div>
              <p className="opacity-80 text-sm font-medium mb-1">My Schedule</p>
              <h1 className="text-3xl font-black">Calendar</h1>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
         </div>

         <div className="bg-white rounded-[2rem] shadow-xl p-4 mb-6 border border-gray-100">
           <Calendar
              onClickDay={setSelectedDate}
              value={selectedDate}
              className="w-full !border-none !font-sans custom-calendar"
              tileClassName={({ date, view }) => {
                 if (view === 'month') {
                    const hasTask = tasks.some(t => {
                       const d = new Date(t.deadline || t.date);
                       return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
                    });
                    return hasTask ? 'has-task-indicator' : null;
                 }
                 return null;
              }}
           />
         </div>

         <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2 flex items-center gap-2">
               {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
               <Badge variant="secondary" className="bg-gray-100 text-gray-600 rounded-lg">{filteredTasks.length}</Badge>
            </h2>

            <div className="space-y-4">
               {loading ? (
                  <div className="text-center py-6 text-gray-400">Loading schedule...</div>
               ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                     No tasks scheduled.
                  </div>
               ) : (
                  filteredTasks.map((task) => (
                    <div key={task.id} className="card-modern bg-white p-5 hover:shadow-lg transition-all border border-gray-100">
                       <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${task.type === 'homework' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                             {task.type}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                             <Users className="w-3 h-3" /> {groups.find((g) => g.id === task.group_id)?.name || "Unknown"}
                          </span>
                       </div>
                       <h3 className="font-bold text-gray-800 mb-1">{task.title}</h3>
                       <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.deadline ? `Due: ${new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'All Day Event'}
                       </p>
                       <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                    </div>
                  ))
               )}
            </div>
         </div>
      </div>
      
      <style>{`
        .react-calendar { width: 100% !important; background: transparent !important; }
        .react-calendar__navigation button { color: #333; font-weight: bold; font-size: 1.1em; }
        .react-calendar__month-view__weekdays { font-size: 0.8em; font-weight: bold; text-transform: uppercase; color: #aaa; text-decoration: none !important; }
        .react-calendar__tile { padding: 10px; font-weight: 500; font-size: 0.9em; border-radius: 12px; }
        .react-calendar__tile--now { background: #eff6ff !important; color: #3b82f6 !important; }
        .react-calendar__tile--active { background: #6366f1 !important; color: white !important; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }
        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #f3f4f6; }
        .has-task-indicator { position: relative; }
        .has-task-indicator::after { content: ''; position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background-color: #ec4899; border-radius: 50%; }
        abbr[title] { text-decoration: none !important; }
      `}</style>
    </div>
  );
}
