import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin,
  Users,
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
      const { data: group, error } = await supabase
        .from("groups")
        .insert([
          {
            name: data.title,
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

      toast({
        title: "Muvaffaqiyatli",
        description: "Yangi guruh yaratildi",
      });

      setGroups([
        {
          id: group.id,
          title: group.name,
          description: group.description,
          location: group.lat && group.lng ? {
            lat: group.lat,
            lng: group.lng,
            address: group.address || "",
          } : null,
          members: 0,
          createdAt: group.created_at,
        },
        ...groups,
      ]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Guruhlar</h1>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hali guruh yo'q
            </h3>
            <p className="text-gray-600 mb-6">
              Birinchi guruhingizni yaratib boshlang
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/teacher-dashboard/groups/${group.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                  {group.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {group.description}
                </p>

                {group.location && (
                  <div className="flex items-start gap-2 mb-4 text-xs text-gray-500">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{group.location.address}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(group.members, 3))].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center"
                        >
                          <span className="text-xs font-medium text-white">
                            {String.fromCharCode(65 + i)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {group.members} a'zo
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyGroupId(group.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
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
