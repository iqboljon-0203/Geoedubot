import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Search, MapPin, Users, BookOpen, SlidersHorizontal, ArrowUpRight, Plus, Zap, Building2 } from "lucide-react";

interface Group {
  id: string;
  title: string;
  description: string;
  teacher: string;
  image_url?: string;
  category?: string;
  members_count?: number;
}

interface SupabaseGroup {
  id: string;
  name: string;
  address: string;
  created_by: string;
}

const categories = ["All Subjects", "Mathematics", "Science", "Literature", "History"];

export default function StudentGroups() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Subjects");
  const { userId } = useAuthStore();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      // Fetch all groups for "Featured" section mock (in reality, this would be a recommendation engine)
      const { data: groupsData } = await supabase.from("groups").select("id, name, address, created_by").limit(5);
        
      const groups = ((groupsData as SupabaseGroup[]) || []).map((g) => ({
        id: g.id,
        title: g.name,
        description: g.address,
        teacher: g.created_by,
        category: ["Mathematics", "Science", "Literature"][Math.floor(Math.random() * 3)],
        members_count: Math.floor(Math.random() * 50) + 10
      }));
      setJoinedGroups(groups);
    };
    fetchGroups();
  }, [userId]);

  const handleJoinGroup = async () => {
    if (!groupId.trim() || !userId) return;
    const { data: groupData } = await supabase.from("groups").select("id").eq("id", groupId.trim()).single();
    if (!groupData) {
      toast({ title: "Error", description: "Group not found.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("group_members").insert([{ group_id: groupId.trim(), user_id: userId }]);
    if (!error) {
       toast({ title: "Success", description: "Successfully joined the group!" });
       setIsJoinModalOpen(false);
       setGroupId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative overflow-hidden font-sans">
       {/* Gradient Header */}
       <div className="bg-[#4F46E5] pb-12 rounded-b-[3rem] shadow-xl pt-10 px-6 text-white relative z-10">
         <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-white/80 text-sm font-medium mb-0.5">Community</p>
              <h1 className="text-2xl font-serif font-bold tracking-wide">STUDY GROUPS</h1>
            </div>
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
         </div>

         {/* Search Bar */}
         <div className="relative mb-8">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
             <Search className="w-5 h-5" />
           </div>
           <input 
             type="text" 
             placeholder="Search for subjects or locations..." 
             className="w-full h-12 bg-[#5d56e8] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-inner"
           />
         </div>

         {/* Categories - Pill Shaped */}
         <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
           {categories.map((cat) => (
             <button 
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                 activeCategory === cat 
                   ? "bg-white text-[#4F46E5]" 
                   : "bg-white/10 text-white hover:bg-white/20"
               }`}
             >
               {cat}
             </button>
           ))}
         </div>
       </div>

       <div className="px-6 mt-8">
         {/* Nearby Groups Map Widget */}
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-gray-900">
             <MapPin className="w-5 h-5 text-teal-500 fill-teal-500" />
             Nearby Groups
           </h2>
           <span className="text-[#4F46E5] text-xs font-bold cursor-pointer hover:underline">Expand Map</span>
         </div>
         
         <div className="bg-white rounded-[2.5rem] p-4 shadow-sm mb-8 relative overflow-hidden h-52 border border-gray-100 group cursor-pointer ring-4 ring-white">
            <div className="absolute inset-0 bg-gray-100 opacity-80 group-hover:scale-105 transition-transform duration-700">
               {/* Decorative Map Pattern */}
               <div className="w-full h-full opacity-30" style={{backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
            </div>
            
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-teal-500/40 relative z-10">
                   <Users className="w-6 h-6" />
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-4 h-4 bg-teal-500 rotate-45"></div>
            </div>

            {/* Other markers */}
            <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center text-white shadow-lg opacity-80">
                <Users className="w-4 h-4" />
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-[1.5rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] flex justify-between items-center z-20">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#4F46E5]">
                    <Building2 className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider mb-0.5">Closest Match</p>
                   <h3 className="font-serif font-bold text-gray-800 text-sm leading-tight">Physics Final Study Circle</h3>
                 </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                 <ArrowUpRight className="w-4 h-4 text-gray-400" />
               </div>
            </div>
         </div>

         {/* Featured Groups List */}
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-serif font-bold text-gray-900">Featured Groups</h2>
           <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm"><SlidersHorizontal className="w-4 h-4 text-gray-600" /></button>
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm" onClick={() => setIsJoinModalOpen(true)}><Plus className="w-4 h-4 text-gray-600" /></button>
           </div>
         </div>

         <div className="space-y-6">
            {joinedGroups.length > 0 ? (
              joinedGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 relative group">
                  <div className="bg-gray-50 rounded-[2rem] h-40 mb-5 relative overflow-hidden">
                     <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <Users className="w-16 h-16 opacity-30" />
                     </div>
                     {/* Tags */}
                     <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">Active</span>
                        <span className="bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">Campus</span>
                     </div>
                  </div>
                  
                  <div className="px-1">
                     <span className="text-[10px] font-bold text-teal-600 uppercase bg-teal-50 px-2 py-1 rounded mb-2 inline-block tracking-wider">
                       {group.category || "Science"}
                     </span>
                     <h3 className="font-serif font-bold text-2xl text-gray-900 mb-4 leading-tight">{group.title}</h3>
                     
                     <div className="flex justify-between items-center mb-6">
                        <div className="flex -space-x-2 items-center">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white" />
                           ))}
                           <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#4F46E5]">+{group.members_count}</div>
                           <span className="ml-3 text-xs font-bold text-gray-500">{group.members_count || 12} Members</span>
                        </div>
                     </div>
                     
                     <Link to={`/student-dashboard/groups/${group.id}`}>
                        <button className="w-full bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95">
                          Quick Join <Zap className="w-4 h-4 fill-white" />
                        </button>
                     </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-[2rem] shadow-sm">
                <p className="text-gray-400 font-medium">Loading groups...</p>
              </div>
            )}
         </div>
       </div>

       <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold">Join a Group</DialogTitle>
            <DialogDescription>Enter the Group ID shared by your teacher.</DialogDescription>
          </DialogHeader>
          <Input className="h-12 rounded-xl bg-gray-50 border-gray-200" placeholder="Group ID..." value={groupId} onChange={(e) => setGroupId(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleJoinGroup} className="w-full rounded-xl h-12 font-bold text-md">Join Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
