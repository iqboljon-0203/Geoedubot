import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Calendar as CalendarIcon, Clock, BookOpen, Briefcase, PartyPopper, Loader2 } from "lucide-react";

export default function StudentCalendar() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [tasks, setTasks] = useState<any[]>([]);
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      if (!userId) return;
      // Student a'zo bo'lgan guruhlar
      const { data: memberData } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map((m: any) => m.group_id);
        // Shu guruhlarga tegishli barcha topshiriqlar, guruh nomi bilan
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*, groups(name)")
          .in("group_id", groupIds);
        
        // Flatten group name
        const processedTasks = tasksData?.map(t => ({
           ...t,
           group: t.groups?.name || 'Guruh'
        })) || [];
        
        setTasks(processedTasks);
      } else {
        setTasks([]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [userId]);

  // Tanlangan kunga mos tasklarni filtrlash
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
    <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-6 pb-24">
      {/* Calendar Section */}
      <div className="bg-card rounded-3xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
             <CalendarIcon className="w-6 h-6 text-primary" />
           </div>
           <div>
             <h2 className="text-xl font-bold">Mening Rejam</h2>
             <p className="text-sm text-muted-foreground">Topshiriqlarni rejalashtirish</p>
           </div>
        </div>
        
        <div className="calendar-wrapper flex justify-center">
             <Calendar 
                onClickDay={setSelectedDate}
                value={selectedDate}
                locale="uz-UZ"
                className="w-full border-none" 
             />
        </div>
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="font-bold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {selectedDate.toLocaleDateString("uz-UZ", { month: 'long', day: 'numeric', year: 'numeric' })}
               </h3>
               <Badge variant="outline" className="px-3 py-1 rounded-lg">
                  {filteredTasks.length} ta topshiriq
               </Badge>
            </div>

            {loading ? (
               <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : filteredTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-3xl border border-dashed border-border/50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                     <PartyPopper className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground">Topshiriqlar yo'q</h4>
                  <p className="text-sm text-muted-foreground">Bugun uchun rejalashtirilgan ishlar yo'q. Dam oling!</p>
               </div>
            ) : (
               <div className="grid gap-3">
                  {filteredTasks.map(task => (
                     <Card key={task.id} className="hover:shadow-md transition-all border-border/60 hover:border-primary/30 group">
                        <CardContent className="p-4 flex items-start gap-4">
                            {/* Task Icon/Type */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${task.type === 'homework' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'}`}>
                                {task.type === 'homework' ? <BookOpen className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex flex-wrap items-start justify-between gap-2">
                                  <h4 className="font-bold truncate text-lg text-foreground">{task.title}</h4>
                                  <Badge variant={task.type === 'homework' ? 'default' : 'secondary'} className="rounded-lg">
                                     {task.type === 'homework' ? 'Uyga vazifa' : 'Amaliyot'}
                                  </Badge>
                               </div>
                               
                               <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                     <Briefcase className="w-4 h-4" />
                                     <span>{task.group}</span>
                                  </div>
                                  {(task.deadline || task.date) && (
                                     <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                          {task.type === 'homework' ? 'Deadline' : 'Sana'}: {new Date(task.deadline || task.date!).toLocaleDateString()}
                                        </span>
                                     </div>
                                  )}
                               </div>
                            </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            )}
        </div>
      )}
    </div>
  );
}
