import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, LogOut, User, Mail, Shield, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const { userId, name, email, role, profileUrl } = useAuthStore();
  const { signOut } = useTelegramAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(name || "");
  const [formAvatar, setFormAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      setFormAvatar(urlData.publicUrl);
      toast({
        title: "Muvaffaqiyatli",
        description: "Rasm yuklandi",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updates: any = { name: formName };
      if (formAvatar) updates.profile_url = formAvatar;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Muvaffaqiyatli",
        description: "Profil yangilandi",
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/role-selection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Mening Profilim</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                {formAvatar || profileUrl ? (
                  <img
                    src={formAvatar || profileUrl || ""}
                    alt={name || "User"}
                    className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 p-6 sm:p-8 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Ism
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="text-lg"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-lg font-medium text-gray-900">{name}</span>
                </div>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Foydalanuvchi nomi (Username)
              </Label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{email}</span>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Rol
              </Label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">
                  {role === "teacher" ? "O'qituvchi" : "Talaba"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-3">
              {isEditing ? (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveProfile} 
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Saqlash
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormName(name || "");
                      setFormAvatar(null);
                    }}
                    className="flex-1 h-12 rounded-2xl"
                  >
                    Bekor qilish
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Tahrirlash
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Chiqish (Logout)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
