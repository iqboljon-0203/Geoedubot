import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Calendar as CalendarIcon, ArrowLeft, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function StudentGroupTasks() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [tasks, setTasks] = useState<any[]>([]);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4 mb-8">
           <Skeleton className="h-10 w-10 rounded-full" />
           <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Skeleton className="h-32 rounded-2xl" />
           <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!group) return <div className="p-8 text-center">Guruh topilmadi</div>;

  return (
    <div className="p-0">
      {/* Decorative Header Background */}
      <div className="h-48 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 relative">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="rounded-full shadow-sm bg-background/80 hover:bg-background backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative space-y-8">
        {/* Group Info Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-[2rem] shadow-xl border-border overflow-hidden bg-card">
            <CardContent className="p-0">
              <div className="flex flex-col items-center pt-8 pb-8 px-6 text-center">
                {/* Teacher Avatar */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-600 shadow-lg">
                    <Avatar className="w-full h-full border-4 border-card">
                      <AvatarImage src={teacher?.avatar} />
                      <AvatarFallback className="bg-muted text-2xl font-bold">
                        {teacher?.full_name?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Badge variant="secondary" className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 shadow-sm border-white/20 whitespace-nowrap">
                    O'qituvchi
                  </Badge>
                </div>

                {/* Teacher Name & Group Role */}
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {teacher?.full_name || "O'qituvchi"}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                   Guruh rahbari
                </p>

                <div className="w-full h-px bg-border mb-6 max-w-sm mx-auto" />

                {/* Group Details */}
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-800 mb-2">
                  {group.name}
                </h1>
                
                {group.description && (
                  <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                    {group.description}
                  </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-muted/50 hover:bg-muted/80 transition-colors">
                        <Users className="w-5 h-5 text-blue-500 mb-1" />
                        <span className="text-xs text-muted-foreground">A'zolar</span>
                        <span className="font-bold">{membersCount}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-muted/50 hover:bg-muted/80 transition-colors">
                        <CalendarIcon className="w-5 h-5 text-purple-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Yaratilgan</span>
                        <span className="font-bold">{group.created_at?.split("T")[0]}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-muted/50 hover:bg-muted/80 transition-colors">
                         <MapPin className="w-5 h-5 text-red-500 mb-1" />
                         <span className="text-xs text-muted-foreground">Manzil</span>
                         <span className="font-bold truncate max-w-[120px]" title={group.address || "Belgilanmagan"}>
                            {group.address ? (group.address.length > 15 ? group.address.substring(0, 15) + '...' : group.address) : "Belgilanmagan"}
                         </span>
                    </div>
                </div>

                {/* View on Map Button if coords exist */}
                {(group.latitude || group.lat) && (group.longitude || group.lng) && (
                   <div className="mt-6">
                      <Button variant="outline" className="rounded-full" size="sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          Xaritada ko'rish
                      </Button>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-xl font-bold">{tasks.length} ta Topshiriq</h2>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Hozircha topshiriqlar yo'q</h3>
              <p className="text-muted-foreground text-sm">O'qituvchi hali topshiriq yuklamagan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/student-dashboard/tasks/${task.id}`)}
                >
                  <Card className="rounded-2xl border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${
                                task.type === 'homework' 
                                ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
                                : 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                            }`}>
                                {task.type === 'homework' ? <FileText className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                            </div>
                            <Badge variant={task.type === 'homework' ? "default" : "secondary"}>
                                {task.type === 'homework' ? "Uyga vazifa" : "Amaliyot"}
                            </Badge>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {task.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                            {task.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                            <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.type === 'internship' ? (
                                    <span>{task.date ? new Date(task.date).toLocaleDateString() : "Sana belgilanmagan"}</span>
                                ) : (
                                    <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "Muddatsiz"}</span>
                                )}
                            </div>
                            {task.max_score && (
                                <div className="font-semibold text-primary">
                                    {task.max_score} Ball
                                </div>
                            )}
                        </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
