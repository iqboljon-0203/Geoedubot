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
import { useTranslation } from "react-i18next";

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
  const { userId } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          title: t('common.error'),
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
  }, [userId, t, toast]);

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
        title: t('common.success'),
        description: t('groups.create_new'),
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
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyGroupId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: t('common.success'),
      description: t('groups.join_code'),
    });
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-20"
      role="main"
      aria-labelledby="groups-title"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-accent rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 id="groups-title" className="text-xl font-bold text-foreground">{t('nav.groups')}</h1>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-10 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              {t('dashboard.quick_actions.new_group')}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('dashboard.recent_activity.no_activity')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('dashboard.quick_actions.new_group')}
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
              {t('groups.create_new')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-primary"
                onClick={() => navigate(`/teacher-dashboard/groups/${group.id}`)}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/teacher-dashboard/groups/${group.id}`)}
                aria-label={group.title}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg" aria-hidden="true">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 hover:bg-accent rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Menu"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 truncate">
                  {group.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                  {group.description || t('groups.description')}
                </p>

                {group.location && (
                  <div className="flex items-start gap-2 mb-4 text-xs text-muted-foreground bg-muted p-3 rounded-xl">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                    <span className="line-clamp-2">{group.location.address}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(group.members, 3))].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-card flex items-center justify-center shadow-sm"
                          aria-hidden="true"
                        >
                          <span className="text-xs font-semibold text-white">
                            {String.fromCharCode(65 + i)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {group.members} {t('groups.members')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyGroupId(group.id);
                    }}
                    className="p-2 hover:bg-accent rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    title={t('groups.join_code')}
                    aria-label={t('groups.join_code')}
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
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
