import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MapPin, Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";

export default function StudentGroupTasks() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [answerDesc, setAnswerDesc] = useState("");
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState("");
  const { userId } = useAuthStore();
  const navigate = useNavigate();

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

      // O'qituvchi ma'lumotini olish
      if (groupData?.created_by) {
        const { data: teacherData } = await supabase
          .from("profiles")
          .select("full_name, avatar")
          .eq("id", groupData.created_by)
          .single();
        setTeacher(teacherData);
      }

      // Guruh a'zolari soni
      const { count } = await supabase
        .from("group_members")
        .select("id", { count: "exact", head: true })
        .eq("group_id", groupId);
      setMembersCount(count || 0);

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

  const handleOpen = (taskId: string) => {
    setOpenTaskId(taskId);
    setAnswerDesc("");
    setAnswerFile(null);
    setLocation(null);
    setLocationError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnswerFile(e.target.files[0]);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError("");
      },
      () => {
        setLocationError("Lokatsiyani aniqlab bo'lmadi");
      }
    );
  };

  const handleSubmit = async (task: any) => {
    // Tavsif majburiy
    if (!answerDesc.trim()) {
      toast({
        title: "Xatolik",
        description: "Tavsif maydoni to'ldirilishi shart!",
        variant: "destructive",
      });
      return;
    }
    // Fayl majburiy
    if (!answerFile) {
      toast({
        title: "Xatolik",
        description: "Fayl yuklash majburiy!",
        variant: "destructive",
      });
      return;
    }
    if (task.type === "internship") {
      // Lokatsiya tekshiruvi
      if (!location) {
        setLocationError("Lokatsiyani aniqlang");
        return;
      }
      const groupLoc = { lat: group.lat, lng: group.lng };

      // Haversine formulasi orqali masofani hisoblash
      const R = 6371e3; // Yer radiusi metrlarda
      const φ1 = (groupLoc.lat * Math.PI) / 180;
      const φ2 = (location.lat * Math.PI) / 180;
      const Δφ = ((location.lat - groupLoc.lat) * Math.PI) / 180;
      const Δλ = ((location.lng - groupLoc.lng) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // metrlarda

      if (distance > 2500) {
        setLocationError(
          `Siz kerakli joydan ${Math.round(distance)} metr uzoqlikdasiz!`
        );
        return;
      }
    }
    let file_url = null;
    if (answerFile) {
      const ext = answerFile.name.split(".").pop();
      const filePath = `${userId}/${task.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("answers")
        .upload(filePath, answerFile, {
          upsert: false,
          contentType: answerFile.type || undefined,
        });
      if (uploadError) {
        toast({
          title: "Fayl yuklashda xatolik",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      file_url = filePath;
    }
    // Javobni answers jadvaliga yozish
    const { error: insertError } = await supabase.from("answers").insert([
      {
        task_id: task.id,
        user_id: userId,
        description: answerDesc,
        file_url,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null,
      },
    ]);
    if (insertError) {
      toast({
        title: "Javob yuborishda xatolik",
        description: insertError.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Muvaffaqiyatli", description: "Javob yuborildi!" });
      setOpenTaskId(null);
    }
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  if (loading) return <div className="p-8">Yuklanmoqda...</div>;
  if (!group) return <div className="p-8">Guruh topilmadi</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        ← Orqaga
      </Button>
      <Card className="rounded-2xl shadow-lg border border-border bg-gradient-to-br from-blue-50 to-white dark:from-muted dark:to-muted/60 p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16">
              {teacher?.avatar ? (
                <img
                  src={teacher.avatar}
                  alt={teacher.full_name}
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <AvatarFallback>
                  {teacher?.full_name
                    ? teacher.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center mt-1">
              <div className="font-semibold text-base">
                {teacher?.full_name || "O'qituvchi"}
              </div>
              <div className="text-xs text-muted-foreground">O'qituvchi</div>
            </div>
          </div>
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2 text-lg font-bold">
              {group.name}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{group.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>Yaratilgan: {group.created_at?.split("T")[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              <span>A'zolar soni: {membersCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Kenglik/Uzunlik: {group.lat}, {group.lng}
              </span>
            </div>
          </div>
        </div>
      </Card>
      <div>
        <h2 className="text-xl font-bold mb-4">Guruh topshiriqlari</h2>
        {tasks.length === 0 ? (
          <div>Hali topshiriq yo'q</div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl shadow-md border border-border bg-white dark:bg-muted/60 hover:shadow-lg transition cursor-pointer p-6 group"
                onClick={() => navigate("/student-dashboard/tasks")}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg">{task.title}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${task.type === "homework" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                  >
                    {task.type === "homework" ? "Uyga vazifa" : "Amaliyot"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {task.description}
                </div>
                {task.deadline && (
                  <div className="text-sm">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </div>
                )}
                {task.date && (
                  <div className="text-sm">
                    Amaliyot kuni: {new Date(task.date).toLocaleDateString()}
                  </div>
                )}
                {task.file_url && (
                  <a
                    href={
                      supabase.storage.from("tasks").getPublicUrl(task.file_url)
                        .data.publicUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Faylni ko'rish
                  </a>
                )}
                <Dialog
                  open={openTaskId === task.id}
                  onOpenChange={(open) => {
                    if (!open) setOpenTaskId(null);
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Javob yuborish</DialogTitle>
                      <DialogDescription>
                        {task.type === "homework"
                          ? "Uyga vazifa uchun javob yuboring."
                          : "Amaliyot topshirig'i uchun faqat amaliyot kuni va kerakli joyda bo'lsangiz javob yuborishingiz mumkin."}
                      </DialogDescription>
                    </DialogHeader>
                    {task.type === "internship" && !isToday(task.date) ? (
                      <div className="text-red-600 text-sm mb-2">
                        Faqat amaliyot kuni javob yuborish mumkin!
                      </div>
                    ) : null}
                    <Input
                      placeholder="Tavsif..."
                      value={answerDesc}
                      onChange={(e) => setAnswerDesc(e.target.value)}
                      className="mb-2"
                      disabled={
                        task.type === "internship" && !isToday(task.date)
                      }
                    />
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      className="mb-2"
                      disabled={
                        task.type === "internship" && !isToday(task.date)
                      }
                    />
                    {task.type === "internship" && (
                      <div className="mb-2">
                        <Button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={
                            task.type === "internship" && !isToday(task.date)
                          }
                        >
                          Lokatsiyani aniqlash
                        </Button>
                        {location && (
                          <div className="text-xs mt-1 text-green-600">
                            Lokatsiya: {location.lat.toFixed(4)},{" "}
                            {location.lng.toFixed(4)}
                          </div>
                        )}
                        {locationError && (
                          <div className="text-xs mt-1 text-red-600">
                            {locationError}
                          </div>
                        )}
                      </div>
                    )}
                    <DialogFooter>
                      <Button
                        onClick={() => handleSubmit(task)}
                        disabled={
                          task.type === "internship" && !isToday(task.date)
                        }
                      >
                        Yuborish
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
