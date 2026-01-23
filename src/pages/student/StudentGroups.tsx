import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MapPin } from "lucide-react";

// Mock guruhlar (real loyihada bu API yoki contextdan olinadi)
const mockGroups = [
  {
    id: "abc12345",
    title: "Web Development",
    description: "Web dasturlash bo'yicha guruh",
    members: 15,
    teacher: "John Doe",
  },
  {
    id: "def67890",
    title: "Database Systems",
    description: "Ma'lumotlar bazasi tizimlari bo'yicha guruh",
    members: 12,
    teacher: "Jane Smith",
  },
];

interface Group {
  id: string;
  title: string;
  description: string;
  teacher: string;
}

interface SupabaseGroup {
  id: string;
  name: string;
  address: string;
  created_by: string;
}

export default function StudentGroups() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<
    Record<string, { full_name: string; avatar?: string }>
  >({});
  const [membersCount, setMembersCount] = useState<Record<string, number>>({});
  const { userId } = useAuthStore();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      const { data: memberData } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (memberData && memberData.length > 0) {
        const groupIds = (memberData as { group_id: string }[]).map(
          (m) => m.group_id
        );
        const { data: groupsData } = await supabase
          .from("groups")
          .select("id, name, address, created_by")
          .in("id", groupIds);
        const groups = ((groupsData as SupabaseGroup[]) || []).map((g) => ({
          id: g.id,
          title: g.name,
          description: g.address,
          teacher: g.created_by,
        }));
        setJoinedGroups(groups);
        // O'qituvchilar va a'zolar sonini olish
        let teacherIds = groups.map((g) =>
          g.teacher && typeof g.teacher === "string"
            ? g.teacher.trim().toLowerCase()
            : g.teacher
        );
        teacherIds = teacherIds.filter(
          (id) => typeof id === "string" && /^[0-9a-f-]{36}$/.test(id)
        );
        teacherIds = Array.from(new Set(teacherIds));
        const teacherMap: Record<
          string,
          { full_name: string; avatar?: string }
        > = {};
        for (const id of teacherIds) {
          if (id) {
            const { data: teacher, error } = await supabase
              .from("profiles")
              .select("id, full_name")
              .eq("id", id)
              .single();
            if (error) {
              // console.log("profiles so'rov xatolik:", error, id);
            }
            if (teacher) {
              teacherMap[id] = { full_name: teacher.full_name };
            }
          }
        }
        setTeachers(teacherMap);
        // Guruh a'zolari soni
        const counts: Record<string, number> = {};
        await Promise.all(
          groups.map(async (g) => {
            const { count } = await supabase
              .from("group_members")
              .select("id", { count: "exact", head: true })
              .eq("group_id", g.id);
            counts[g.id] = count || 0;
          })
        );
        setMembersCount(counts);
      } else {
        setJoinedGroups([]);
      }
    };
    fetchGroups();
  }, [userId]);

  const handleJoinGroup = async () => {
    if (!groupId.trim()) return;
    if (!userId) {
      toast({
        title: "Xatolik",
        description: "Foydalanuvchi aniqlanmadi",
        variant: "destructive",
      });
      return;
    }
    // Guruh mavjudligini tekshirish
    const { data: groupData } = await supabase
      .from("groups")
      .select("id")
      .eq("id", groupId.trim())
      .single();
    if (!groupData) {
      toast({
        title: "Xatolik",
        description: "Bunday ID bilan guruh topilmadi.",
        variant: "destructive",
      });
      return;
    }
    // Avval a'zo emasligini tekshirish
    const { data: alreadyMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId.trim())
      .eq("user_id", userId)
      .maybeSingle();
    if (alreadyMember) {
      toast({
        title: "Diqqat",
        description: "Siz bu guruhga allaqachon qo'shilgansiz.",
      });
      setIsJoinModalOpen(false);
      setGroupId("");
      return;
    }
    // Qo'shish
    const { error } = await supabase
      .from("group_members")
      .insert([{ group_id: groupId.trim(), user_id: userId }]);
    if (error) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Muvaffaqiyatli", description: "Guruhga qo'shildingiz!" });
      setIsJoinModalOpen(false);
      setGroupId("");
      // Guruhlar ro'yxatini yangilash
      const { data: groupsData } = await supabase
        .from("groups")
        .select("id, name, address, created_by")
        .eq("id", groupId.trim());
      if (groupsData && groupsData.length > 0) {
        setJoinedGroups((prev) => [
          ...prev,
          {
            id: groupsData[0].id,
            title: groupsData[0].name,
            description: groupsData[0].address,
            teacher: groupsData[0].created_by,
          },
        ]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Guruhlar</h1>
        <Button onClick={() => setIsJoinModalOpen(true)}>
          Guruhga qo'shilish
        </Button>
      </div>

      {joinedGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">
              Siz hali hech bir guruhga qo'shilmagansiz
            </p>
            <Button onClick={() => setIsJoinModalOpen(true)}>
              Guruhga qo'shilish
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {joinedGroups.map((group) => (
            <Card
              key={group.id}
              className="rounded-2xl shadow-lg border border-border bg-gradient-to-br from-blue-50 to-white dark:from-muted dark:to-muted/60 p-0 overflow-hidden relative"
            >
              {/* Yuqori o'ng burchakda badge */}
              <span className="absolute top-4 right-4 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                {membersCount[group.id] ?? 0} a'zo
              </span>
              <div className="flex flex-col gap-2 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {teachers[group.teacher]?.full_name
                        ? teachers[group.teacher].full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-base">
                      {teachers[group.teacher]?.full_name || "O'qituvchi"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      O'qituvchi
                    </div>
                  </div>
                </div>
                <div className="font-bold text-lg mb-1">{group.title}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{group.description}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  <span>A'zolar soni: {membersCount[group.id] ?? 0}</span>
                </div>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to={`/student-dashboard/groups/${group.id}`}>
                    Batafsil
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guruhga qo'shilish</DialogTitle>
            <DialogDescription>
              O'qituvchingizdan olingan guruh ID sini kiriting va guruhga
              qo'shiling.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Guruh ID..."
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoinGroup()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleJoinGroup}>Qo'shilish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
