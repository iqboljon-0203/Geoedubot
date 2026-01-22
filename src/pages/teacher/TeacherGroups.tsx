import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, MapPin, Calendar, Copy, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GroupDetailsModal } from "@/components/modals/GroupDetailsModal";
import { AddTaskModal } from "@/components/modals/AddTaskModal";
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
  teacher: {
    name: string;
    avatar?: string;
  };
}

const TeacherGroups = () => {
  const { toast } = useToast();
  const { userId, name } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
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
        toast({ title: "Xatolik", description: error.message, variant: "destructive" });
      } else if (data) {
        const groupsWithMembers = await Promise.all(
          data.map(async (g: any) => {
            const { count } = await supabase.from("group_members").select("id", { count: "exact", head: true }).eq("group_id", g.id);
            return {
              id: g.id,
              title: g.name,
              description: g.description || "",
              location: { lat: g.lat, lng: g.lng, address: g.address },
              members: count || 0,
              createdAt: g.created_at?.split("T")[0] || "",
              teacher: { name: name || "Teacher", avatar: "https://github.com/shadcn.png" },
            };
          })
        );
        setGroups(groupsWithMembers);
      }
    };
    fetchGroups();
  }, [userId, name, toast]);

  const handleCreateGroup = async (data: any) => {
    try {
      if (!userId) throw new Error("Authentication Error");
      const { data: group, error } = await supabase.from("groups").insert([{
            name: data.title,
            description: data.description,
            lat: data.location.lat,
            lng: data.location.lng,
            address: data.location.address,
            created_by: userId,
      }]).select().single();
      
      if (error) throw error;
      
      setGroups((prev) => [
        {
          id: group.id,
          title: group.name,
          description: data.description,
          location: { lat: group.lat, lng: group.lng, address: group.address },
          members: 0,
          createdAt: group.created_at?.split("T")[0] || "",
          teacher: { name: name || "Teacher", avatar: "https://github.com/shadcn.png" },
        },
        ...prev,
      ]);
      toast({ title: "Success", description: "Group Created" });
    } catch (error: any) {
      console.error("Create Group Error:", error);
      if (error.code === '401' || error.status === 401 || error.code === '403' || error.status === 403) {
         toast({ 
           title: "Authorization Error", 
           description: "Sizning sessiyangiz tugagan yoki huquqingiz yo'q. Iltimos, qaytadan kiring.", 
           variant: "destructive" 
         });
         // Optional: Redirect to login or logout
      } else {
         toast({ title: "Error", description: error.message || "Guruh yaratishda xatolik", variant: "destructive" });
      }
    }
  };

  const handleOpenDetails = (group: Group) => {
    navigate(`/teacher-dashboard/groups/${group.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-primary-gradient h-48 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0 content-['']" />

      <div className="relative z-10 pt-8 px-6">
        <div className="flex justify-between items-center mb-8 text-white">
          <div>
            <h1 className="text-3xl font-black">My Groups</h1>
            <p className="opacity-80 text-sm font-medium">Manage your classes</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-transform active:scale-95"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="space-y-4 pb-4">
          {groups.length === 0 ? (
             <div className="text-center py-10 bg-white rounded-[2rem] shadow-soft">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No Groups</h3>
                <p className="text-gray-500 text-sm">Create your first group to get started.</p>
             </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="card-modern bg-white p-5 hover:shadow-xl transition-all">
                 <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-bold">
                      {group.members} Students
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400" onClick={() => {
                        navigator.clipboard.writeText(group.id);
                        toast({ title: "Copied!", description: "Group ID copied to clipboard." });
                      }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                 </div>
                 
                 <h3 className="text-xl font-bold text-gray-800 mb-1">{group.title}</h3>
                 <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{group.description}</p>
                 
                 <div className="space-y-2 mb-4">
                    {group.location && (
                       <div className="flex items-center text-xs text-gray-500">
                         <MapPin className="w-3 h-3 mr-2" />
                         <span className="truncate">{group.location.address}</span>
                       </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                       <Calendar className="w-3 h-3 mr-2" />
                       <span>{group.createdAt}</span>
                    </div>
                 </div>

                 <Button className="w-full rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100 shadow-none font-bold" onClick={() => handleOpenDetails(group)}>
                    Manage Group <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
      <GroupDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {setIsDetailsOpen(false); setSelectedGroup(null)}}
        group={selectedGroup}
        onAddTask={() => setIsAddTaskOpen(true)}
      />
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={(data) => console.log(data)}
        group={selectedGroup}
      />
    </div>
  );
};

export default TeacherGroups;
