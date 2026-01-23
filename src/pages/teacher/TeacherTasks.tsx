import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Calendar, Clock, FileText, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { AddTaskModal } from "@/components/modals/AddTaskModal";
import { TaskDetailsModal } from "@/components/modals/TaskDetailsModal";

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
    return groups.find((g) => g.id === groupId)?.name || "Unknown";
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Topshiriqlar</h1>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yangi topshiriq
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hali topshiriq yo'q
            </h3>
            <p className="text-gray-600 mb-6">
              Birinchi topshiriqni yaratib boshlang
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Topshiriq yaratish
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-2xl">
                      {task.type === "homework" ? "📝" : "💼"}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.type === "homework"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.type === "homework" ? "Uyga vazifa" : "Amaliyot"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>{getGroupName(task.group_id)}</span>
                  </div>
                  {(task.deadline || task.date) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
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
                  className="w-full py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Tahrirlash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        groups={groups}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
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
