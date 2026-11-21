import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, FileText, Users, Building2, ExternalLink } from "lucide-react";

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Guruh a'zolari va ularning amaliyot maktablarini olish (Dual ta'lim)
      try {
        const { data: membersData } = await supabase
          .from("group_members")
          .select(`
            id,
            user_id,
            school_name,
            practice_lat,
            practice_lng,
            practice_address,
            joined_at,
            profiles:user_id (
              full_name,
              avatar
            )
          `)
          .eq("group_id", groupId);

        setMembers(membersData || []);
      } catch (err) {
        console.warn("Could not fetch members:", err);
      }

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
              onClick={() => navigate(`/teacher-dashboard/groups/${groupId}/create-task`)}
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

        {/* Dual Education: Students & Practice Schools */}
        <Card className="rounded-3xl shadow-sm border border-zinc-200/60 bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-zinc-200/60 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                Dual ta'lim: Talabalar va amaliyot maktablari
              </CardTitle>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                {members.length} ta talaba
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {members.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">
                Bu guruhga hali talabalar qo'shilmagan.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {members.map((m, idx) => {
                  const studentName = m.profiles?.full_name || "Talaba #" + (idx + 1);
                  const hasSchool = !!m.school_name;
                  return (
                    <div key={m.id || idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                          {studentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 text-sm">{studentName}</h4>
                          {hasSchool ? (
                            <div className="mt-0.5 space-y-0.5">
                              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {m.school_name}
                              </p>
                              {m.practice_address && (
                                <p className="text-[11px] text-zinc-500">
                                  📍 {m.practice_address}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 font-medium mt-0.5">
                              ⚠️ Amaliyot maktabi hali biriktirilmagan
                            </p>
                          )}
                        </div>
                      </div>

                      {m.practice_lat && m.practice_lng && (
                        <a
                          href={`https://www.google.com/maps?q=${m.practice_lat},${m.practice_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors flex-shrink-0 self-start sm:self-auto"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Xaritada ko'rish</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
    </div>
  );
}
