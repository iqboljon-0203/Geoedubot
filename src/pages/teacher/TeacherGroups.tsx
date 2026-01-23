import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin,
  Copy,
  ArrowLeft,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

interface Group {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  members: number;
  createdAt: string;
}

const TeacherGroups = () => {
  const { toast } = useToast();
  const { userId, name } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, description, lat, lng, address, created_at")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({
          title: "Xatolik",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        const groupsWithMembers = await Promise.all(
          data.map(async (g: any) => {
            const { count } = await supabase
              .from("group_members")
              .select("id", { count: "exact", head: true })
              .eq("group_id", g.id);
            return {
              id: g.id,
              title: g.name,
              description: g.description,
              location: g.lat && g.lng ? {
                lat: g.lat,
                lng: g.lng,
                address: g.address || "",
              } : null,
              members: count || 0,
              createdAt: g.created_at,
            };
          })
        );
        setGroups(groupsWithMembers);
      }
    };
    fetchGroups();
  }, [userId]);

  const handleCreateGroup = async (data: any) => {
    if (!userId) return;
    try {
      const { data: newGroup, error } = await supabase
        .from("groups")
        .insert([
          {
            name: data.name,
            description: data.description,
            lat: data.location?.lat,
            lng: data.location?.lng,
            address: data.location?.address,
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add creator as member
      await supabase.from("group_members").insert([
        {
          group_id: newGroup.id,
          user_id: userId,
        },
      ]);

      toast({
        title: "Muvaffaqiyatli",
        description: "Guruh yaratildi",
      });
      setIsCreateModalOpen(false);
      
      // Refresh groups
      const { data: updatedData } = await supabase
        .from("groups")
        .select("id, name, description, lat, lng, address, created_at")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });
      
      if (updatedData) {
        const groupsWithMembers = await Promise.all(
          updatedData.map(async (g: any) => {
            const { count } = await supabase
              .from("group_members")
              .select("id", { count: "exact", head: true })
              .eq("group_id", g.id);
            return {
              id: g.id,
              title: g.name,
              description: g.description,
              location: g.latitude && g.longitude ? {
                lat: g.latitude,
                lng: g.longitude,
                address: g.address || "",
              } : null,
              members: count || 0,
              createdAt: g.created_at,
            };
          })
        );
        setGroups(groupsWithMembers);
      }
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyGroupId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Nusxalandi",
      description: "Guruh ID nusxalandi",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </button>
              <h1 className="text-xl font-bold text-zinc-900">Guruhlar</h1>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yangi guruh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Hali guruh yo'q
            </h3>
            <p className="text-zinc-600 mb-6">
              Birinchi guruhingizni yaratib boshlang
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Guruh yaratish
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200/60 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
                onClick={() => navigate(`/teacher-dashboard/groups/${group.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-2 truncate">
                  {group.title}
                </h3>
                <p className="text-sm text-zinc-600 mb-4 line-clamp-2 min-h-[40px]">
                  {group.description || "Tavsif yo'q"}
                </p>

                {group.location && (
                  <div className="flex items-start gap-2 mb-4 text-xs text-zinc-500 bg-zinc-50 p-3 rounded-xl">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span className="line-clamp-2">{group.location.address}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200/60">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(group.members, 3))].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center shadow-sm"
                        >
                          <span className="text-xs font-semibold text-white">
                            {String.fromCharCode(65 + i)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-zinc-700">
                      {group.members} a'zo
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyGroupId(group.id);
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                    title="ID nusxalash"
                  >
                    <Copy className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
};

export default TeacherGroups;
