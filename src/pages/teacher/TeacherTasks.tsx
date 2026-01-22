import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Briefcase, Calendar, FileText, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TeacherTasks() {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [openTask, setOpenTask] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      const { data, error } = await supabase.from("groups").select("id, name").eq("created_by", userId);
      if (!error && data) setGroups(data);
    };
    fetchGroups();
  }, [userId]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || groups.length === 0) return;
      const { data, error } = await supabase.from("tasks").select("*").in("group_id", groups.map((g) => g.id));
      if (!error && data) setTasks(data);
    };
    fetchTasks();
  }, [groups, userId]);

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
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    const { data, error } = await supabase.storage.from("tasks").upload(`${userId}/${Date.now()}_${file.name}`, file);
    setFileUploading(false);
    if (!error) setForm((prev: any) => ({ ...prev, file: data.path }));
  };

  const handleSaveTask = async () => {
    if (!form.title || !form.groupId || !form.type) return alert("Required fields missing");
    
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
      await supabase.from("tasks").update(payload).eq("id", openTask.id);
    } else {
      await supabase.from("tasks").insert([payload]);
    }
    setOpenTask(null);
    // Refresh
    const { data } = await supabase.from("tasks").select("*").in("group_id", groups.map((g) => g.id));
    if (data) setTasks(data);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-primary-gradient h-48 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0 content-['']" />

      <div className="relative z-10 pt-8 px-6">
        <div className="flex justify-between items-center mb-8 text-white">
          <div>
            <h1 className="text-3xl font-black">My Tasks</h1>
            <p className="opacity-80 text-sm font-medium">Manage assignments & internships</p>
          </div>
          <button 
            onClick={() => navigate("/teacher-dashboard/tasks/add")}
            className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-transform active:scale-95"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="space-y-4 pb-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="card-modern bg-white p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleOpenTask(task)}
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${task.type === 'homework' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {task.type === 'homework' ? <Briefcase className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                     <h3 className="font-bold text-gray-800 truncate pr-2">{task.title}</h3>
                     <Badge variant="outline" className={`${task.type === 'homework' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-green-600 bg-green-50 border-green-200'}`}>
                       {task.type === "homework" ? "Homework" : "Internship"}
                     </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <span className="font-semibold text-gray-500">{groups.find((g) => g.id === task.group_id)?.name}</span>
                    <span>•</span>
                    {task.type === "homework" ? (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {new Date(task.deadline).toLocaleDateString()}</span>
                    ) : (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(task.date).toLocaleDateString()}</span>
                    )}
                  </p>
                  
                  {task.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-[2rem] shadow-soft">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                 <FileText className="w-8 h-8" />
               </div>
               <h3 className="text-gray-900 font-bold mb-1">No Tasks Found</h3>
               <p className="text-gray-500 text-sm">Create your first task to get started.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!openTask} onOpenChange={() => setOpenTask(null)}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {openTask && (
            <div className="space-y-4">
               <div>
                 <Label>Title</Label>
                 <Input name="title" value={form.title} onChange={handleChange} className="rounded-xl" />
               </div>
               <div>
                 <Label>Description</Label>
                 <Textarea name="description" value={form.description} onChange={handleChange} className="rounded-xl" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <select name="type" value={form.type} onChange={handleChange} className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                       <option value="homework">Homework</option>
                       <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <Label>Group</Label>
                    <select name="groupId" value={form.groupId} onChange={handleChange} className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                       {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
               </div>
               
               <div>
                  <Label>{form.type === 'homework' ? 'Deadline' : 'Date'}</Label>
                  <Input 
                    type="date" 
                    name={form.type === 'homework' ? 'deadline' : 'date'} 
                    value={form.type === 'homework' ? form.deadline : form.date} 
                    onChange={handleChange} 
                    className="rounded-xl"
                  />
               </div>

               <div>
                 <Label>Attachment</Label>
                 <Input type="file" onChange={handleFileChange} className="rounded-xl" />
                 {fileUploading && <span className="text-xs text-blue-500">Uploading...</span>}
               </div>

               <div className="flex justify-end gap-2 pt-2">
                 <Button variant="ghost" onClick={() => setOpenTask(null)}>Cancel</Button>
                 <Button onClick={handleSaveTask}>Save Changes</Button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
