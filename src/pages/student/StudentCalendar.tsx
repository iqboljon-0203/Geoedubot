import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";

export default function StudentCalendar() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [tasks, setTasks] = useState<any[]>([]);
  const { userId } = useAuthStore();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      // Student a'zo bo'lgan guruhlar
      const { data: memberData } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map((m: any) => m.group_id);
        // Shu guruhlarga tegishli barcha topshiriqlar
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .in("group_id", groupIds);
        setTasks(tasksData || []);
      } else {
        setTasks([]);
      }
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
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Kalendar</CardTitle>
          <CardDescription>
            Kalendar orqali faqat a'zo bo'lgan guruhlardagi topshiriqlarni
            ko'ring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            onClickDay={setSelectedDate}
            value={selectedDate}
            locale="uz-UZ"
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            {selectedDate.toLocaleDateString()} uchun topshiriqlar:
          </h2>
          {filteredTasks.length === 0 ? (
            <div className="text-muted-foreground">
              Bu kunda topshiriq yo'q.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover:shadow-md transition-shadow border border-primary/20"
                >
                  <CardContent className="flex flex-col gap-2 py-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-base">
                        {task.title}
                      </span>
                      <Badge
                        variant={
                          task.type === "homework" ? "secondary" : "outline"
                        }
                      >
                        {task.type === "homework" ? "Uyga vazifa" : "Amaliyot"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{task.group}</span>
                      {(task.deadline || task.date) && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-muted text-xs">
                          {task.deadline
                            ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}`
                            : `Amaliyot kuni: ${new Date(task.date!).toLocaleDateString()}`}
                        </span>
                      )}
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
