import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";

// Mock guruhlar va lokatsiyalar
const mockGroups = [
  {
    id: "abc12345",
    title: "Web Development",
    location: { lat: 41.3, lng: 69.2 },
  },
  {
    id: "def67890",
    title: "Database Systems",
    location: { lat: 41.4, lng: 69.3 },
  },
];

const homeworkTasks = [
  {
    id: "1",
    title: "Tadqiqot ishini topshirish",
    deadline: "2025-06-15",
    status: "pending",
    group: "Tadqiqot usullari",
    type: "homework",
    grade: null,
  },
  {
    id: "2",
    title: "Testni yakunlash",
    deadline: "2025-06-20",
    status: "submitted",
    group: "Dasturiy ta'minot muhandisligi",
    type: "homework",
    grade: 8,
  },
  {
    id: "3",
    title: "5-chi laboratoriya mashg'uloti",
    deadline: "2025-06-25",
    status: "pending",
    group: "Ma'lumotlar bazasi tizimlari",
    type: "homework",
    grade: null,
  },
];

const internshipTasks = [
  {
    id: "4",
    title: "Dasturiy ta'minot sinovi",
    date: "2025-07-01",
    status: "pending",
    group: "Sifat nazorati",
    type: "internship",
    groupId: "abc12345",
    grade: null,
  },
  {
    id: "5",
    title: "Ma'lumotlar bazasi migratsiyasi",
    date: "2025-07-05",
    status: "submitted",
    group: "Ma'lumotlar bazasi tizimlari",
    type: "internship",
    groupId: "def67890",
    grade: 10,
  },
];

function isToday(dateStr) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

const StudentTasks = () => {
  const [openTask, setOpenTask] = useState(null);
  const [answerDesc, setAnswerDesc] = useState("");
  const [answerFile, setAnswerFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const { userId } = useAuthStore();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      // Student a'zo bo'lgan guruhlar
      const { data: memberData } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map((m) => m.group_id);
        setGroups(groupIds);
        // Shu guruhlarga tegishli barcha topshiriqlar
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .in("group_id", groupIds)
          .order("created_at", { ascending: false });
        setTasks(tasksData || []);
      } else {
        setGroups([]);
        setTasks([]);
      }
    };
    fetchTasks();
  }, [userId]);

  const handleOpen = (task) => {
    setOpenTask(task);
    setAnswerDesc("");
    setAnswerFile(null);
    setLocation(null);
    setLocationError("");
  };

  const handleFileChange = (e) => {
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

  const handleSubmit = async (task) => {
    // Majburiy maydonlar tekshiruvi
    if (!answerDesc.trim()) {
      toast({
        title: "Xatolik",
        description: "Tavsif maydoni to'ldirilishi shart!",
        variant: "destructive",
      });
      return;
    }
    if (!answerFile) {
      toast({
        title: "Xatolik",
        description: "Fayl yuklash majburiy!",
        variant: "destructive",
      });
      return;
    }
    if (task.type === "internship") {
      if (!location) {
        setLocationError("Lokatsiyani aniqlang");
        return;
      }
      // Guruh lokatsiyasini olish
      const { data: groupData } = await supabase
        .from("groups")
        .select("lat, lng")
        .eq("id", task.group_id)
        .single();
      if (groupData) {
        const groupLoc = { lat: groupData.lat, lng: groupData.lng };
        const dist = Math.sqrt(
          Math.pow(location.lat - groupLoc.lat, 2) +
            Math.pow(location.lng - groupLoc.lng, 2)
        );
        if (dist > 0.02) {
          setLocationError("Siz kerakli joyda emassiz!");
          return;
        }
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
      setOpenTask(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Topshiriqlar</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topshiriqlar</CardTitle>
          <CardDescription>
            Barcha topshiriqlarni ko'rish va boshqarish
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="homework" className="space-y-4">
            <TabsList>
              <TabsTrigger value="homework">Uyga vazifalar</TabsTrigger>
              <TabsTrigger value="internship">Amaliyot</TabsTrigger>
            </TabsList>
            <TabsContent value="homework" className="space-y-4">
              {tasks
                .filter((task) => task.type === "homework")
                .map((task) => (
                  <div
                    key={task.id}
                    className="border border-border rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Uyga vazifa
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {task.group} • Muddati{" "}
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                    <Button
                      className="min-w-[110px]"
                      onClick={() => handleOpen(task)}
                    >
                      Topshirish
                    </Button>
                    <Dialog
                      open={openTask?.id === task.id}
                      onOpenChange={() => setOpenTask(null)}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Javob yuborish</DialogTitle>
                          <DialogDescription>
                            Uyga vazifa uchun javob yuboring.
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          placeholder="Tavsif..."
                          value={answerDesc}
                          onChange={(e) => setAnswerDesc(e.target.value)}
                          className="mb-2"
                        />
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          className="mb-2"
                        />
                        <DialogFooter>
                          <Button onClick={() => handleSubmit(task)}>
                            Yuborish
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
            </TabsContent>
            <TabsContent value="internship" className="space-y-4">
              {tasks
                .filter((task) => task.type === "internship")
                .map((task) => (
                  <div
                    key={task.id}
                    className="border border-border rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          Amaliyot
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isToday(task.date)
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isToday(task.date) ? "Bugun" : "Kelgusi"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {task.group} • Rejada{" "}
                        {task.date
                          ? new Date(task.date).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                    <Button
                      className="min-w-[110px]"
                      onClick={() => handleOpen(task)}
                      disabled={!isToday(task.date)}
                    >
                      Topshirish
                    </Button>
                    <Dialog
                      open={openTask?.id === task.id}
                      onOpenChange={() => setOpenTask(null)}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Javob yuborish</DialogTitle>
                          <DialogDescription>
                            Amaliyot topshirig'i uchun faqat amaliyot kuni va
                            kerakli joyda bo'lsangiz javob yuborishingiz mumkin.
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          placeholder="Tavsif..."
                          value={answerDesc}
                          onChange={(e) => setAnswerDesc(e.target.value)}
                          className="mb-2"
                          disabled={!isToday(task.date)}
                        />
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          className="mb-2"
                          disabled={!isToday(task.date)}
                        />
                        <div className="mb-2">
                          <Button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={!isToday(task.date)}
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
                        <DialogFooter>
                          <Button
                            onClick={() => handleSubmit(task)}
                            disabled={!isToday(task.date)}
                          >
                            Yuborish
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTasks;
