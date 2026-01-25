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
import { useTranslation } from 'react-i18next';

const ResponsiveProfile = () => {
  const { userId, name, email, role, profileUrl, logout, setUser } = useAuthStore();
  const { signOut } = useTelegramAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        title: t('common.success'),
        description: t('profile.image_uploaded'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
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
      const updates: any = { full_name: formName };
      if (formAvatar) updates.avatar = formAvatar;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('profile.profile_updated'),
      });
      setUser({
        id: userId!,
        email: email!,
        name: formName,
        role: role!,
        profileUrl: formAvatar || profileUrl,
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    logout();
    localStorage.removeItem('hamkor_user');
    localStorage.removeItem('user-storage');
    localStorage.setItem('manual_logout', 'true');
    navigate('/role-selection', { replace: true });
  };

  const getRoleLabel = () => {
    return role === 'teacher' ? t('auth.teacher') : t('auth.student');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted"
      role="main"
      aria-labelledby="profile-title"
    >
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-accent rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('common.back')}
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 id="profile-title" className="text-xl font-bold text-foreground">
              {t('profile.title')}
            </h1>
          </div>
        </div>
      </header>

      {/* Desktop & Mobile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('profile.my_profile')}</h1>
          <p className="text-muted-foreground">{t('profile.manage_info')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card - Takes full width on mobile, 2 cols on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
              {/* Profile Header with Gradient */}
              <div className="relative h-32 md:h-40 bg-gradient-to-r from-primary via-purple-600 to-primary">
                <div className="absolute -bottom-16 md:-bottom-20 left-1/2 md:left-8 transform -translate-x-1/2 md:translate-x-0">
                  <div className="relative">
                    {formAvatar || profileUrl ? (
                      <img
                        src={formAvatar || profileUrl || ''}
                        alt={name || 'User'}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-card shadow-xl"
                      />
                    ) : (
                      <div 
                        className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-primary to-purple-500 border-4 border-card shadow-xl flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <User className="w-16 h-16 md:w-20 md:h-20 text-white" />
                      </div>
                    )}
                    
                    {isEditing && (
                      <>
                        <label
                          htmlFor="avatar-upload"
                          className={cn(
                            'absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary/90 transition-all focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
                            uploading && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {uploading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" aria-label={t('common.loading')} />
                          ) : (
                            <Camera className="w-6 h-6 text-white" aria-hidden="true" />
                          )}
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="sr-only"
                            disabled={uploading}
                            aria-label={t('profile.image_uploaded')}
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
                      <Edit2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      {t('common.edit')}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-white hover:bg-white/90 text-primary rounded-2xl"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                        )}
                        {t('common.save')}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setFormName(name || '');
                          setFormAvatar(null);
                        }}
                        variant="ghost"
                        className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-2xl"
                        aria-label={t('common.cancel')}
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
                  <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground">
                    {t('profile.name')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="h-14 text-lg rounded-2xl border-border focus:border-primary focus:ring-primary"
                      placeholder={t('profile.enter_name')}
                    />
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl border border-border">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <span className="text-lg font-medium text-foreground">{name}</span>
                    </div>
                  )}
                </div>

                {/* Email/Username Field */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    {t('profile.username')}
                  </Label>
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <span className="text-foreground">{email}</span>
                  </div>
                </div>

                {/* Role Field */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    {t('profile.role')}
                  </Label>
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" aria-hidden="true" />
                    </div>
                    <span className="text-foreground">{getRoleLabel()}</span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="md:hidden pt-6 space-y-3">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                            {t('profile.saving')}
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" aria-hidden="true" />
                            {t('common.save')}
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
                        className="flex-1 h-14 rounded-2xl border-border"
                      >
                        <X className="w-5 h-5 mr-2" aria-hidden="true" />
                        {t('common.cancel')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold"
                    >
                      <Edit2 className="w-5 h-5 mr-2" aria-hidden="true" />
                      {t('common.edit')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions - Desktop Only */}
          <aside className="hidden lg:block space-y-6" aria-label={t('profile.quick_info')}>
            {/* Quick Stats Card */}
            <div className="bg-card rounded-3xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">{t('profile.quick_info')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
                  <span className="text-sm text-muted-foreground">{t('profile.role')}</span>
                  <span className="text-sm font-semibold text-primary">
                    {getRoleLabel()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-500/5 rounded-xl">
                  <span className="text-sm text-muted-foreground">{t('common.status')}</span>
                  <span className="text-sm font-semibold text-purple-600">{t('common.active')}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-card rounded-3xl shadow-sm border border-destructive/20 p-6">
              <h3 className="text-lg font-bold text-destructive mb-2">{t('profile.danger_zone')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('profile.logout_description')}
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                {t('common.logout')}
              </Button>
            </div>
          </aside>

          {/* Mobile Logout Button */}
          <div className="lg:hidden">
            <div className="bg-card rounded-3xl shadow-sm border border-destructive/20 p-6">
              <h3 className="text-lg font-bold text-destructive mb-2">{t('common.logout')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('profile.logout_from_app')}
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                {t('common.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveProfile;
