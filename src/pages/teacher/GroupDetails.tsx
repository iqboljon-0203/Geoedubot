import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddTaskModal } from "@/components/modals/AddTaskModal";
import { MapPin, Calendar, FileText } from "lucide-react";

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Guruh ma'lumotini olish
      const { data: groupData } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();
      setGroup(groupData);

      // Tasklarni olish
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      setTasks(tasksData || []);
      setLoading(false);
    };
    if (groupId) fetchData();
  }, [groupId]);

  if (loading) return <div className="p-8">Yuklanmoqda...</div>;
  if (!group) return <div className="p-8">Guruh topilmadi</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              ← Orqaga
            </Button>
            <Button
              onClick={() => setIsAddTaskOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold"
            >
              Guruhga topshiriq qo'shish
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Group Info Card */}
        <Card className="rounded-3xl shadow-sm border border-zinc-200/60 bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-zinc-200/60">
            <CardTitle className="text-2xl font-bold text-zinc-900">{group.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">Manzil:</p>
                <p className="text-zinc-900">{group.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">Kenglik/Uzunlik:</p>
                <p className="text-zinc-900 font-mono text-sm">
                  {group.latitude}, {group.longitude}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">Yaratilgan:</p>
                <p className="text-zinc-900">
                  {group.created_at ? new Date(group.created_at).toLocaleDateString('uz-UZ') : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Guruh topshiriqlari
          </h2>
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Hali topshiriq yo'q
              </h3>
              <p className="text-zinc-600">
                Yuqoridagi tugma orqali topshiriq qo'shing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className="rounded-3xl shadow-sm border border-zinc-200/60 bg-white hover:shadow-md transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg font-bold text-zinc-900">
                        {task.title}
                      </CardTitle>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          task.type === "homework"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.type === "homework" ? "📝 Uyga vazifa" : "💼 Amaliyot"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-zinc-600">
                      {task.type === "homework"
                        ? `📅 Deadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString('uz-UZ') : "-"}`
                        : `📅 Amaliyot kuni: ${task.date ? new Date(task.date).toLocaleDateString('uz-UZ') : "-"}`}
                    </div>
                    {task.description && (
                      <div className="text-sm text-zinc-700 p-3 bg-zinc-50 rounded-xl">
                        {task.description}
                      </div>
                    )}
                    {task.file_url && (
                      <a
                        href={
                          supabase.storage
                            .from("tasks")
                            .getPublicUrl(task.file_url).data.publicUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        📎 Faylni ko'rish
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={async () => {
          // Task qo'shilgandan so'ng ro'yxatni yangilash
          const { data: tasksData } = await supabase
            .from("tasks")
            .select("*")
            .eq("group_id", groupId)
            .order("created_at", { ascending: false });
          setTasks(tasksData || []);
        }}
        group={{ id: group.id, title: group.name }}
      />
    </div>
  );
}
