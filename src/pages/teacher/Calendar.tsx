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
  group_id: string;
}

export default function TeacherCalendar() {
  const today = new Date();
  const { userId } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);

  // Teacher o'zi yaratgan guruhlarni olish
  useEffect(() => {
    const fetchGroupsAndTasks = async () => {
      setLoading(true);
      if (!userId) return;
      // Guruhlar
      const { data: groupData } = await supabase
        .from("groups")
        .select("id, name")
        .eq("created_by", userId);
      setGroups((groupData as GroupType[]) || []);
      // Tasklar
      if (groupData && groupData.length > 0) {
        const groupIds = (groupData as GroupType[]).map((g) => g.id);
        const { data: taskData } = await supabase
          .from("tasks")
          .select("*, group_id")
          .in("group_id", groupIds);
        setTasks((taskData as TaskType[]) || []);
      } else {
        setTasks([]);
      }
      setLoading(false);
    };
    fetchGroupsAndTasks();
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
            Kalendar orqali topshiriqlarni ko'ring va boshqaring
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
          {loading ? (
            <div>Yuklanmoqda...</div>
          ) : filteredTasks.length === 0 ? (
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
                      <span>
                        {groups.find((g) => g.id === task.group_id)?.name ||
                          "-"}
                      </span>
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
