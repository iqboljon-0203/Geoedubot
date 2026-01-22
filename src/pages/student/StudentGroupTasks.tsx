import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Calendar as CalendarIcon, ChevronLeft, ArrowRight, FileText, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const { userId } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!groupId) return;
      
      const { data: groupData } = await supabase.from("groups").select("*").eq("id", groupId).single();
      setGroup(groupData);

      if (groupData?.created_by) {
        const { data: teacherData } = await supabase.from("profiles").select("full_name, avatar").eq("id", groupData.created_by).single();
        setTeacher(teacherData);
      }

      const { count } = await supabase.from("group_members").select("id", { count: "exact", head: true }).eq("group_id", groupId);
      setMembersCount(count || 0);

      const { data: tasksData } = await supabase.from("tasks").select("*").eq("group_id", groupId).order("created_at", { ascending: false });
      setTasks(tasksData || []);
      setLoading(false);
    };
    fetchData();
  }, [groupId]);

  const handleOpen = (taskId: string) => {
    setOpenTaskId(taskId);
    setAnswerDesc("");
    setAnswerFile(null);
    setLocation(null);
    setLocationError("");
  };

  const handleGetLocation = () => {
     if (!navigator.geolocation) {
      setLocationError("Browser geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError("");
      },
      () => setLocationError("Location access denied")
    );
  };

  const handleSubmit = async (task: any) => {
    if (!answerDesc.trim()) return toast({title: "Error", description: "Description required", variant: "destructive"});
    if (!answerFile) return toast({title: "Error", description: "File required", variant: "destructive"});
    
    if (task.type === "internship") {
      if (!location) {
        setLocationError("Please verify your location");
        return;
      }
      // Check distance (simple logic for demo, can be improved)
      const latDiff = Math.abs(location.lat - group.lat);
      const lngDiff = Math.abs(location.lng - group.lng);
      if (latDiff > 0.02 || lngDiff > 0.02) {
          setLocationError("You are not at the required location!");
          return; 
      }
    }

    let file_url = null;
    if (answerFile) {
       const ext = answerFile.name.split(".").pop();
       const filePath = `${userId}/${task.id}/${Date.now()}.${ext}`;
       const { error } = await supabase.storage.from("answers").upload(filePath, answerFile);
       if(error) return toast({title: "Upload Error", description: error.message, variant: "destructive"});
       file_url = filePath;
    }

    const { error: insertError } = await supabase.from("answers").insert([{
      task_id: task.id,
      user_id: userId,
      description: answerDesc,
      file_url,
      location_lat: location?.lat || null,
      location_lng: location?.lng || null,
    }]);

    if (insertError) {
      toast({title: "Error", description: insertError.message, variant: "destructive"});
    } else {
      toast({title: "Success", description: "Submitted successfully!"});
      setOpenTaskId(null);
    }
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Group Details...</div>;
  if (!group) return <div className="p-8 text-center text-red-500">Group not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-primary-gradient h-64 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0 content-['']" />

      <div className="relative z-10 pt-6 px-4">
        <Button 
           variant="ghost" 
           onClick={() => navigate(-1)} 
           className="text-white hover:bg-white/20 mb-4 p-2 h-auto rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="flex justify-between items-start text-white mb-6 px-2">
           <div>
              <div className="flex items-center gap-2 mb-1 opacity-90 text-sm">
                 <Users className="w-4 h-4" /> {membersCount} Members
              </div>
              <h1 className="text-3xl font-black leading-tight mb-2">{group.name}</h1>
              <div className="flex items-center gap-2 text-sm opacity-80">
                 <MapPin className="w-4 h-4" /> {group.address || "No Address"}
              </div>
           </div>
           
           <div className="flex flex-col items-center">
              <Avatar className="w-16 h-16 border-4 border-white/20 shadow-xl mb-1">
                 <AvatarImage src={teacher?.avatar} />
                 <AvatarFallback className="bg-white/10 text-white font-bold text-xl">{teacher?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold opacity-80 max-w-[80px] text-center truncate">{teacher?.full_name}</span>
           </div>
        </div>

        <div className="space-y-4 pb-4">
            <h2 className="text-xl font-bold text-gray-800 px-2 flex items-center justify-between">
              Group Tasks
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">{tasks.length}</Badge>
            </h2>

            {tasks.length === 0 ? (
               <div className="text-center py-10 bg-white rounded-[2rem] shadow-soft mx-2">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-gray-900 font-bold mb-1">No Tasks</h3>
                  <p className="text-gray-500 text-sm">No tasks assigned to this group yet.</p>
               </div>
            ) : (
               tasks.map((task) => (
                 <div
                    key={task.id}
                    className="card-modern bg-white p-5 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => handleOpen(task.id)}
                 >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${task.type === 'homework' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                         {task.type}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-2">{task.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                       <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : task.date ? new Date(task.date).toLocaleDateString() : 'No Date'}
                       </span>
                       <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <ArrowRight className="w-4 h-4" />
                       </div>
                    </div>

                    <Dialog
                      open={openTaskId === task.id}
                      onOpenChange={(open) => !open && setOpenTaskId(null)}
                    >
                       <DialogContent className="rounded-2xl max-w-sm mx-4">
                          <DialogHeader>
                             <DialogTitle>Submit: {task.title}</DialogTitle>
                             <DialogDescription>{task.type === 'internship' ? 'Location check required.' : 'Upload your files.'}</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 pt-2">
                            <Input placeholder="Comment..." value={answerDesc} onChange={(e) => setAnswerDesc(e.target.value)} className="rounded-xl" disabled={task.type === 'internship' && !isToday(task.date)} />
                            <Input type="file" onChange={(e) => e.target.files && setAnswerFile(e.target.files[0])} className="rounded-xl" disabled={task.type === 'internship' && !isToday(task.date)} />
                            
                            {task.type === 'internship' && (
                              <div className="bg-blue-50 p-3 rounded-xl flex justify-between items-center">
                                 <span className="text-xs font-bold text-blue-700 flex items-center gap-1"><MapPin className="w-3 h-3" /> {location ? 'Located' : 'Check Location'}</span>
                                 <Button size="sm" variant="outline" onClick={handleGetLocation} className="h-7 text-xs" disabled={!isToday(task.date)}>Verify</Button>
                              </div>
                            )}

                            {locationError && <p className="text-xs text-red-500 font-bold text-center">{locationError}</p>}
                          </div>
                          
                          <DialogFooter>
                             <Button onClick={() => handleSubmit(task)} className="w-full rounded-xl" disabled={task.type === 'internship' && !isToday(task.date)}>Submit Answer</Button>
                          </DialogFooter>
                       </DialogContent>
                    </Dialog>
                 </div>
               ))
            )}
        </div>
      </div>
    </div>
  );
}
