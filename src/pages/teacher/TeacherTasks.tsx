import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, MapPin, FileText, ArrowLeft, MoreVertical, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "homework" | "internship";
  group_id: string;
  created_at: string;
  deadline?: string;
  date?: string;
}

const TeacherTasks = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("groups")
        .select("id, name")
        .eq("created_by", userId);
      if (data) setGroups(data);
    };
    fetchGroups();
  }, [userId]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || groups.length === 0) return;
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .in(
          "group_id",
          groups.map((g) => g.id)
        )
        .order("created_at", { ascending: false });
      if (!error && data) setTasks(data);
    };
    if (groups.length > 0) fetchTasks();
  }, [groups, userId]);

  const getGroupName = (groupId: string) => {
    return groups.find((g) => g.id === groupId)?.name || "Guruh";
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getGroupName(task.group_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="p-0"
      role="main"
      aria-labelledby="tasks-title"
    >
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-accent rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 id="tasks-title" className="text-xl font-bold text-foreground">{t('nav.tasks')}</h1>
            </div>
            <Button
              onClick={() => navigate("/teacher-dashboard/tasks/add")}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{t('tasks.add_new')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-20 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t('common.search', 'Qidirish...')}
            className="pl-12 h-14 rounded-2xl bg-card border-border focus:ring-primary shadow-sm relative z-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('tasks.no_tasks_yet')}</h3>
            <p className="text-muted-foreground mb-6">{t('tasks.no_tasks_found')}</p>
            <Button
              onClick={() => navigate("/teacher-dashboard/tasks/add")}
              className="rounded-full"
            >
              {t('tasks.add_new')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="group p-6 bg-card border-border hover:border-primary transition-all hover:shadow-xl cursor-pointer overflow-hidden relative"
                onClick={() => navigate(`/teacher-dashboard/groups/${task.group_id}`)}
              >
                {/* Type Indicator */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                  task.type === "homework" ? "bg-blue-500" : "bg-orange-500"
                )} />

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      task.type === "homework" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                    )}>
                      {task.type === "homework" ? <FileText className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1 pr-8">
                        {task.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                        {getGroupName(task.group_id)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full -mt-2 -mr-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {task.deadline || task.date ? new Date(task.deadline || task.date || '').toLocaleDateString() : t('common.no_date')}
                    </span>
                  </div>
                  <Badge className={cn(
                    "rounded-lg font-bold px-3 py-1",
                    task.type === "homework" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                  )}>
                    {task.type === "homework" ? t('tasks.homework') : t('tasks.internship')}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTasks;
