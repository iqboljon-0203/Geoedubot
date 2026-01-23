import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";

export default function TeacherTasks() {
  const { userId } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [openTask, setOpenTask] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [fileUploading, setFileUploading] = useState(false);

  // Guruhlar va topshiriqlarni Supabase'dan olish
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
      if (!userId) return;
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .in(
          "group_id",
          groups.map((g) => g.id)
        );
      if (!error && data) setTasks(data);
    };
    if (groups.length > 0) fetchTasks();
  }, [groups, userId]);

  // Task ochilganda formani to'ldirish
  const handleOpenTask = (task: any) => {
    setOpenTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      deadline: task.deadline || "",
      date: task.date || "",
      file: task.file_url || null,
      groupId: task.group_id,
      type: task.type,
    });
    setSelectedGroupId(task.group_id);
  };

  // Input o'zgarishi
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  // Fayl yuklash
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setFileUploading(true);
    const { data, error } = await supabase.storage
      .from("tasks")
      .upload(`${userId}/${Date.now()}_${file.name}`, file);
    setFileUploading(false);
    if (error) {
      alert("Fayl yuklashda xatolik: " + error.message);
      return;
    }
    setForm((prev: any) => ({ ...prev, file: data.path }));
  };

  // Yangi yoki tahrirlangan topshiriqni saqlash
  const handleSaveTask = async () => {
    if (!form.title || !form.groupId || !form.type)
      return alert("Barcha maydonlarni to'ldiring");
    const payload: any = {
      title: form.title,
      description: form.description,
      type: form.type,
      group_id: form.groupId,
      file_url: form.file,
      created_by: userId,
      deadline: form.type === "homework" ? form.deadline : null,
      date: form.type === "internship" ? form.date : null,
    };
    if (openTask && openTask.id) {
      // Tahrirlash
      await supabase.from("tasks").update(payload).eq("id", openTask.id);
    } else {
      // Yangi topshiriq
      await supabase.from("tasks").insert([payload]);
    }
    setOpenTask(null);
    // Qayta yuklash
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .in(
        "group_id",
        groups.map((g) => g.id)
      );
    if (data) setTasks(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Topshiriqlar</h1>
        <Link
          to="/teacher-dashboard/tasks/add"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
        >
          + Yangi topshiriq
        </Link>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5"
          >
            <div className="flex-1 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl font-semibold mb-0">
                  {task.title}
                </CardTitle>
                <Badge
                  variant={task.type === "homework" ? "default" : "secondary"}
                  className={
                    task.type === "homework"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }
                >
                  {task.type === "homework" ? "Uyga vazifa" : "Amaliyot"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                Guruh: {groups.find((g) => g.id === task.group_id)?.name}
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {task.type === "homework"
                  ? `Muddat: ${task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}`
                  : `Amaliyot kuni: ${task.date ? new Date(task.date).toLocaleDateString() : "-"}`}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {task.description}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 md:mt-0 flex items-center gap-1"
              onClick={() => handleOpenTask(task)}
            >
              <Pencil className="w-4 h-4" /> Tahrirlash
            </Button>
          </Card>
        ))}
      </div>
      <Dialog open={!!openTask} onOpenChange={() => setOpenTask(null)}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Topshiriqni tahrirlash</DialogTitle>
          </DialogHeader>
          {openTask && (
            <form className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nomi</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Masalan: Frontend vazifa"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-foreground transition"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Tavsifi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Vazifa haqida qisqacha yozing..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-foreground transition resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Guruh</label>
                <select
                  name="groupId"
                  value={form.groupId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-foreground transition"
                >
                  <option value="">Guruhni tanlang</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Turi</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-foreground transition"
                >
                  <option value="homework">Uyga vazifa</option>
                  <option value="internship">Amaliyot</option>
                </select>
              </div>
              {form.type === "homework" ? (
                <div>
                  <label className="block mb-1 font-medium">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-foreground transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block mb-1 font-medium">
                    Amaliyot sanasi
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-foreground transition"
                  />
                </div>
              )}
              <div>
                <label className="block mb-1 font-medium">Fayl</label>
                <div className="flex items-center gap-2 overflow-hidden">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex-shrink-0 px-4 py-2 rounded-lg border border-border bg-muted text-foreground cursor-pointer hover:bg-blue-50 transition text-sm font-medium"
                  >
                    Fayl tanlash
                  </label>
                  {form.file && typeof form.file === "string" && (
                    <span className="text-xs text-muted-foreground truncate max-w-xs block">
                      {form.file}
                    </span>
                  )}
                </div>
                {fileUploading && (
                  <div className="text-xs text-blue-500 mt-1">
                    Yuklanmoqda...
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setOpenTask(null)}
                  className="px-4 py-2 rounded-lg"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveTask}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Saqlash
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
