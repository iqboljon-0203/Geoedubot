import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  LogOut, 
  User, 
  Mail, 
  Shield, 
  ArrowLeft,
  Edit2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const ResponsiveProfile = () => {
  const { userId, name, email, role, profileUrl } = useAuthStore();
  const { signOut } = useTelegramAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(name || '');
  const [formAvatar, setFormAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setFormAvatar(urlData.publicUrl);
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Rasm yuklandi',
      });
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updates: any = { name: formName };
      if (formAvatar) updates.profile_url = formAvatar;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Muvaffaqiyatli',
        description: 'Profil yangilandi',
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </button>
            <h1 className="text-xl font-bold text-zinc-900">Profil</h1>
          </div>
        </div>
      </div>

      {/* Desktop & Mobile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Mening Profilim</h1>
          <p className="text-zinc-600">Shaxsiy ma'lumotlaringizni boshqaring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card - Takes full width on mobile, 2 cols on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/60 overflow-hidden">
              {/* Profile Header with Gradient */}
              <div className="relative h-32 md:h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                <div className="absolute -bottom-16 md:-bottom-20 left-1/2 md:left-8 transform -translate-x-1/2 md:translate-x-0">
                  <div className="relative">
                    {formAvatar || profileUrl ? (
                      <img
                        src={formAvatar || profileUrl || ''}
                        alt={name || 'User'}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-white shadow-xl flex items-center justify-center">
                        <User className="w-16 h-16 md:w-20 md:h-20 text-white" />
                      </div>
                    )}
                    
                    {isEditing && (
                      <>
                        <label
                          htmlFor="avatar-upload"
                          className={cn(
                            'absolute bottom-2 right-2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-all',
                            uploading && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {uploading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <Camera className="w-6 h-6 text-white" />
                          )}
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Desktop Edit Button */}
                <div className="hidden md:block absolute top-6 right-6">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-2xl"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Tahrirlash
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-white hover:bg-white/90 text-blue-600 rounded-2xl"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Saqlash
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setFormName(name || '');
                          setFormAvatar(null);
                        }}
                        variant="ghost"
                        className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-2xl"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="pt-20 md:pt-24 p-6 md:p-8 space-y-6">
                {/* Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-zinc-700">
                    Ism
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="h-14 text-lg rounded-2xl border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Ismingizni kiriting"
                    />
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-lg font-medium text-zinc-900">{name}</span>
                    </div>
                  )}
                </div>

                {/* Email/Username Field */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-zinc-700">
                    Foydalanuvchi nomi
                  </Label>
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-zinc-900">{email}</span>
                  </div>
                </div>

                {/* Role Field */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-zinc-700">
                    Rol
                  </Label>
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-zinc-900">
                      {role === 'teacher' ? "O'qituvchi" : 'Talaba'}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="md:hidden pt-6 space-y-3">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saqlanmoqda...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Saqlash
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormName(name || '');
                          setFormAvatar(null);
                        }}
                        className="flex-1 h-14 rounded-2xl border-zinc-300"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Bekor qilish
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    >
                      <Edit2 className="w-5 h-5 mr-2" />
                      Tahrirlash
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions - Desktop Only */}
          <div className="hidden lg:block space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/60 p-6">
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Tezkor ma'lumot</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-zinc-600">Rol</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {role === 'teacher' ? "O'qituvchi" : 'Talaba'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="text-sm text-zinc-600">Holat</span>
                  <span className="text-sm font-semibold text-purple-600">Faol</span>
                </div>
              </div>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-red-200/60 p-6">
              <h3 className="text-lg font-bold text-red-600 mb-2">Xavfli zona</h3>
              <p className="text-sm text-zinc-600 mb-4">
                Hisobdan chiqish uchun quyidagi tugmani bosing
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Chiqish
              </Button>
            </div>
          </div>

          {/* Mobile Logout Button */}
          <div className="lg:hidden">
            <div className="bg-white rounded-3xl shadow-sm border border-red-200/60 p-6">
              <h3 className="text-lg font-bold text-red-600 mb-2">Hisobdan chiqish</h3>
              <p className="text-sm text-zinc-600 mb-4">
                Ilovadan chiqish uchun quyidagi tugmani bosing
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold"
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

export default ResponsiveProfile;
