import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { Briefcase, Calendar, CheckCircle2, Clock, MapPin, UploadCloud, FileText } from "lucide-react";

function isToday(dateStr: string) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

const StudentTasks = () => {
  const [openTask, setOpenTask] = useState<any>(null);
  const [answerDesc, setAnswerDesc] = useState("");
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("homework");
  const { userId } = useAuthStore();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      const { data: memberData } = await supabase.from("group_members").select("group_id").eq("user_id", userId);
      
      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map((m) => m.group_id);
        const { data: tasksData } = await supabase.from("tasks").select("*").in("group_id", groupIds).order("created_at", { ascending: false });
        setTasks(tasksData || []);
      }
    };
    fetchTasks();
  }, [userId]);

  const handleOpen = (task: any) => {
    setOpenTask(task);
    setAnswerDesc("");
    setAnswerFile(null);
    setLocation(null);
    setLocationError("");
  };

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setAnswerFile(e.target.files[0]);
    }
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
    if (!answerDesc.trim()) return toast({ title: "Error", description: "Description required", variant: "destructive" });
    if (!answerFile) return toast({ title: "Error", description: "File required", variant: "destructive" });
    
    if (task.type === "internship") {
      if (!location) {
         setLocationError("Please verify your location");
         return;
      }
      // Check distance (simplified logic)
      const { data: groupData } = await supabase.from("groups").select("lat, lng").eq("id", task.group_id).single();
      if (groupData) {
         const latDiff = Math.abs(location.lat - groupData.lat);
         const lngDiff = Math.abs(location.lng - groupData.lng);
         if (latDiff > 0.02 || lngDiff > 0.02) {
             setLocationError("You are not at the required location!");
             return; 
         }
      }
    }

    let file_url = null;
    if (answerFile) {
      const ext = answerFile.name.split(".").pop();
      const filePath = `${userId}/${task.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("answers").upload(filePath, answerFile);
      if (error) return toast({ title: "Upload Error", description: error.message, variant: "destructive" });
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
       toast({ title: "Error", description: insertError.message, variant: "destructive" });
    } else {
       toast({ title: "Success", description: "Task submitted!" });
       setOpenTask(null);
    }
  };

  const filteredTasks = tasks.filter(t => t.type === activeTab);

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
       {/* Gradient Header */}
       <div className="bg-primary-gradient h-48 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0 content-['']" />
       
       <div className="relative z-10 pt-8 px-6">
         <div className="flex justify-between items-center mb-8 text-white">
            <div>
              <p className="opacity-80 text-sm font-medium mb-1">My Assignments</p>
              <h1 className="text-3xl font-black">Tasks</h1>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
         </div>
         
         {/* Tabs */}
         <div className="flex p-1 bg-white/50 backdrop-blur-sm rounded-xl mb-6 shadow-sm">
            <button 
              onClick={() => setActiveTab("homework")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'homework' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Homework
            </button>
            <button 
              onClick={() => setActiveTab("internship")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'internship' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Internship
            </button>
         </div>

         <div className="space-y-4">
            {filteredTasks.length > 0 ? (
               filteredTasks.map((task) => (
                  <div key={task.id} className="card-modern bg-white p-5 hover:shadow-xl transition-shadow">
                     <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${task.type === 'homework' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                           {task.type}
                        </span>
                        {task.type === 'internship' && isToday(task.date) && (
                           <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                             <CheckCircle2 className="w-3 h-3" /> Today
                           </span>
                        )}
                     </div>
                     
                     <h3 className="font-bold text-gray-800 text-lg mb-1">{task.title}</h3>
                     <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.type === 'homework' ? `Due ${new Date(task.deadline).toLocaleDateString()}` : `Date: ${new Date(task.date).toLocaleDateString()}`}
                     </p>
                     
                     <Button 
                       onClick={() => handleOpen(task)}
                       className={`w-full rounded-xl py-5 font-bold shadow-none ${task.type === 'internship' && !isToday(task.date) ? 'opacity-50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                       disabled={task.type === 'internship' && !isToday(task.date)}
                     >
                       {task.type === 'internship' && !isToday(task.date) ? 'Locked' : 'Submit Task'}
                     </Button>
                  </div>
               ))
            ) : (
              <div className="text-center py-10 bg-white rounded-[2rem] shadow-soft">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-gray-900 font-bold mb-1">No Tasks</h3>
                  <p className="text-gray-500 text-sm">You are all caught up!</p>
               </div>
            )}
         </div>
       </div>

       <Dialog open={!!openTask} onOpenChange={() => setOpenTask(null)}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Submit Answer</DialogTitle>
            <DialogDescription>
              {openTask?.type === 'internship' ? 'Internalships require location verification.' : 'Upload your work below.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
             <div>
                <Input placeholder="Description or comments..." value={answerDesc} onChange={(e) => setAnswerDesc(e.target.value)} className="rounded-xl" />
             </div>
             
             <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center cursor-pointer hover:bg-gray-100 transition relative">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">{answerFile ? answerFile.name : "Tap to upload file"}</p>
             </div>

             {openTask?.type === 'internship' && (
                <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-between">
                   <div className="text-blue-700 text-xs font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {location ? "Location Verified" : "Location Required"}
                   </div>
                   <Button size="sm" variant="outline" onClick={handleGetLocation} className="h-8 rounded-lg bg-white border-blue-200 text-blue-600 hover:bg-blue-50">
                      Check
                   </Button>
                </div>
             )}
             
             {(locationError) && <p className="text-xs text-red-500 font-bold text-center">{locationError}</p>}
          </div>

          <DialogFooter className="mt-2">
            <Button onClick={() => handleSubmit(openTask)} className="w-full rounded-xl">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentTasks;
