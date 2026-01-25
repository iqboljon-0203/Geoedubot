import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin,
  Copy,
  ArrowLeft,
  MoreVertical,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
      
      try {
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
                description: g.description || "",
                location: g.address ? {
                  lat: g.lat,
                  lng: g.lng,
                  address: g.address
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

    fetchGroups();
  }, [userId, toast, t]);

  const copyGroupId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: t('common.success'),
      description: t('groups.join_code'),
    });
  };

  const handleCreateGroup = async (groupData: any) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name: groupData.name,
          description: groupData.description,
          lat: groupData.location?.lat,
          lng: groupData.location?.lng,
          address: groupData.location?.address,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('groups.created'),
      });
      setIsCreateModalOpen(false);
      
      // Refresh list
      const newGroup: Group = {
        id: data.id,
        title: data.name,
        description: data.description || "",
        location: data.address ? {
          lat: data.lat,
          lng: data.lng,
          address: data.address
        } : null,
        members: 0,
        createdAt: data.created_at,
      };

      setGroups([newGroup, ...groups]);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="p-0"
      role="main"
      aria-labelledby="groups-title"
    >
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{t('groups.create_new')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {groups.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('groups.no_groups_yet')}</h3>
            <p className="text-muted-foreground mb-6">{t('groups.create_first')}</p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-full"
            >
              {t('groups.create_new')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="group p-6 bg-card border-border hover:border-primary transition-all hover:shadow-xl cursor-pointer"
                onClick={() => navigate(`/teacher-dashboard/groups/${group.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyGroupId(group.id);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {group.title}
                </h3>
                
                {/* Group Code Display */}
                <div 
                  className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded-md mb-4 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyGroupId(group.id);
                  }}
                  title={t('groups.join_code')}
                >
                  <code className="text-xs font-mono text-muted-foreground">{group.id}</code>
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </div>

                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{group.members} {t('groups.students_count')}</span>
                  </div>
                  {group.location && (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{group.location.address}</span>
                    </div>
                  )}
                </div>
              </Card>
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
