import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Calendar, FileText, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { AddTaskModal } from "@/components/modals/AddTaskModal";
import { TaskDetailsModal } from "@/components/modals/TaskDetailsModal";
import { useTranslation } from "react-i18next";

interface Task {
  id: string;
  title: string;
  description?: string;
  type: "homework" | "internship";
  deadline?: string;
  date?: string;
  group_id: string;
  file_url?: string;
}

export default function TeacherTasks() {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [groups, setGroups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .eq("created_by", userId);
      if (!error && data) setGroups(data);
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
    return groups.find((g) => g.id === groupId)?.name || t('nav.groups');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-20"
      role="main"
      aria-labelledby="tasks-title"
    >
      {/* Header - solid background */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              onClick={() => setIsAddModalOpen(true)}
              className="h-10 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              {t('dashboard.quick_actions.create_task')}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
              <FileText className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('dashboard.recent_activity.no_activity')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('dashboard.quick_actions.create_task')}
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
              {t('dashboard.quick_actions.create_task')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-primary"
                onClick={() => handleTaskClick(task)}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTaskClick(task)}
                aria-label={task.title}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center" aria-hidden="true">
                    <span className="text-2xl">
                      {task.type === "homework" ? "📝" : "💼"}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.type === "homework"
                        ? "bg-primary/10 text-primary"
                        : "bg-green-500/10 text-green-600"
                    }`}
                  >
                    {task.type === "homework" ? t('tasks.todo') : t('tasks.done')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 truncate">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    <span>{getGroupName(task.group_id)}</span>
                  </div>
                  {(task.deadline || task.date) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {new Date(
                          task.deadline || task.date || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskClick(task);
                  }}
                  className="w-full py-2 rounded-xl bg-muted hover:bg-accent text-foreground font-medium text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                  {t('common.edit')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        group={groups.length > 0 ? { id: groups[0].id, title: groups[0].name } : null}
        onSubmit={async () => {
          // Refresh tasks after adding
          if (groups.length > 0) {
            const { data } = await supabase
              .from("tasks")
              .select("*")
              .in("group_id", groups.map((g) => g.id))
              .order("created_at", { ascending: false });
            if (data) setTasks(data);
          }
        }}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedTask(null);
          }}
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            type: selectedTask.type,
            group: getGroupName(selectedTask.group_id),
            deadline: selectedTask.deadline,
            desc: selectedTask.description,
            fileUrl: selectedTask.file_url,
          }}
          onSave={async (updatedTask) => {
            // Update logic here
            setIsDetailsOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
