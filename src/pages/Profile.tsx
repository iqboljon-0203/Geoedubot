import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, LogOut, GraduationCap, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { name, email, role, profileUrl, userId, setUser, logout } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(name || "");
  const [formAvatar, setFormAvatar] = useState<string | null>(profileUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image size must be less than 5MB", variant: "destructive" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Only image files are allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      if (formAvatar) {
        const oldPath = formAvatar.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${userId}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      if (data?.path) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(data.path);
        setFormAvatar(publicUrl);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: formName, avatar: formAvatar })
      .eq("id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setUser({
      id: userId!,
      email: email!,
      name: formName,
      role: role!,
      profileUrl: formAvatar,
    });
    toast({ title: "Success", description: "Profile updated successfully." });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/role-selection");
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Gradient Header - increased height for better spacing */}
      <div className="bg-primary-gradient h-48 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0 content-['']" />

      <div className="relative z-10 pt-16 px-6 max-w-xl mx-auto text-center">
        {/* Profile Picture */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
            {formAvatar || profileUrl ? (
                <img
                  src={formAvatar || profileUrl || ""}
                  alt={name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <User className="w-12 h-12" />
                </div>
            )}
          </div>
          
          {isEditing && (
            <label 
              htmlFor="avatar-upload"
              className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100 text-primary"
            >
              <Camera className="w-5 h-5" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
          {uploading && (
             <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full">
               Uploading...
             </span>
          )}
        </div>

        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1 leading-tight">{name}</h1>
        <p className="text-gray-500 font-medium mb-8 capitalize">{role} Account</p>

        <div className="card-modern bg-white text-left shadow-xl mb-6">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
               <User className="w-5 h-5 text-primary" />
               Personal Info
             </h2>
             {!isEditing && (
               <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-indigo-50 font-bold" onClick={() => setIsEditing(true)}>
                 Edit
               </Button>
             )}
           </div>

           <div className="space-y-5">
             <div className="space-y-2">
               <Label htmlFor="name" className="text-gray-500 text-xs uppercase tracking-wide font-bold pl-1">Full Name</Label>
               {isEditing ? (
                 <Input
                   id="name"
                   value={formName}
                   onChange={(e) => setFormName(e.target.value)}
                   className="bg-gray-50 border-gray-200 rounded-xl h-12 focus:ring-primary/20 focus:border-primary px-4"
                 />
               ) : (
                 <div className="p-4 bg-gray-50 rounded-2xl font-medium text-gray-700 border border-transparent">
                   {name}
                 </div>
               )}
             </div>

             <div className="space-y-2">
               <Label className="text-gray-500 text-xs uppercase tracking-wide font-bold pl-1">Email / Username</Label>
               <div className="p-4 bg-gray-50 rounded-2xl font-medium text-gray-700 overflow-hidden text-ellipsis">
                 {email}
               </div>
             </div>

             <div className="space-y-2">
               <Label className="text-gray-500 text-xs uppercase tracking-wide font-bold pl-1">Role</Label>
                 <div className="flex gap-2">
                   <div className={`px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2 ${role === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                      {role === 'teacher' ? <GraduationCap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      <span className="capitalize">{role}</span>
                   </div>
                 </div>
             </div>
             
             {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile} className="flex-1 rounded-xl py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">Save Changes</Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl py-6 border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      setIsEditing(false);
                      setFormName(name || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
           </div>
        </div>

        <Button 
          variant="destructive" 
          className="w-full rounded-2xl py-6 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-none font-bold text-base flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
