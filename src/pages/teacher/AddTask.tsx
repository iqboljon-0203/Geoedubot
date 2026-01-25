import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddTask() {
  const { t } = useTranslation();
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "homework",
    deadline: "",
    date: "",
    groupId: "",
    file: null,
  });
  const [fileUploading, setFileUploading] = useState(false);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    const { data, error } = await supabase.storage
      .from("tasks")
      .upload(`${userId}/${Date.now()}_${file.name}`, file);
    setFileUploading(false);
    if (error) {
      toast.error(t('tasks.create.error') + ": " + error.message);
      return;
    }
    setForm((prev) => ({ ...prev, file: data.path }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.groupId || !form.type) {
      toast.error(t('common.fill_all_fields'));
      return;
    }
    const payload: {
      title: string;
      description: string;
      type: "homework" | "internship";
      group_id: string;
      file_url: string | null;
      created_by: string;
      deadline: string | null;
      date: string | null;
    } = {
      title: form.title,
      description: form.description,
      type: form.type as "homework" | "internship",
      group_id: form.groupId,
      file_url: form.file,
      created_by: userId || "",
      deadline: form.type === "homework" ? (form.deadline || null) : null,
      date: form.type === "internship" ? (form.date || null) : null,
    };
    const { error } = await supabase.from("tasks").insert([payload]);
    if (error) {
      toast.error(t('tasks.create.error') + ": " + error.message);
    } else {
      toast.success(t('tasks.create.success'));
      navigate("/teacher-dashboard/tasks");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-card rounded-3xl shadow-xl p-8 border border-border">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {t('tasks.create.title')}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-foreground">{t('tasks.create.task_title')}</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={t('tasks.create.title_placeholder')}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition shadow-sm"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-foreground">{t('tasks.create.description')}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t('tasks.create.description_placeholder')}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition resize-none shadow-sm"
              rows={4}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-foreground">{t('nav.groups')}</label>
            <select
              name="groupId"
              value={form.groupId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition shadow-sm"
            >
              <option value="">{t('groups.select_group')}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-foreground">{t('tasks.create.type')}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: 'homework' }))}
                className={`py-3 rounded-xl border-2 transition-all font-semibold ${form.type === 'homework' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
              >
                {t('tasks.create.homework')}
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: 'internship' }))}
                className={`py-3 rounded-xl border-2 transition-all font-semibold ${form.type === 'internship' ? 'border-green-600 bg-green-500/10 text-green-600' : 'border-border bg-background text-muted-foreground'}`}
              >
                {t('tasks.create.internship')}
              </button>
            </div>
          </div>
          
          {form.type === "homework" ? (
            <div>
              <label className="block mb-2 font-semibold text-foreground">{t('tasks.create.deadline')}</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition shadow-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block mb-2 font-semibold text-foreground">{t('tasks.internship_day')}</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition shadow-sm"
              />
            </div>
          )}
          
          <div>
            <label className="block mb-2 font-semibold text-foreground">{t('tasks.create.attachment')}</label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border border-border rounded-xl bg-background cursor-pointer"
              />
              {fileUploading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            {form.file && (
              <p className="text-xs text-muted-foreground mt-2 truncate max-w-full">
                {form.file}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-lg shadow-lg border-0"
            disabled={fileUploading}
          >
            {fileUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('common.loading')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                {t('common.save')}
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
