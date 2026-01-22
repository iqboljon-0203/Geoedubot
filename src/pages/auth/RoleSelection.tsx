import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useTelegram } from "@/hooks/useTelegram";
import type { UserRole } from "@/types";

const RoleSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const { user: telegramUser } = useTelegram();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleSelect = async (role: UserRole) => {
    if (!telegramUser) {
      toast({
        title: "Xatolik",
        description: "Telegram ma'lumotlari topilmadi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`;
      
      // Telegram user ID asosida profile yaratish/yangilash
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("telegram_user_id", telegramUser.id)
        .maybeSingle();

      if (selectError) throw selectError;

      let userId: string;
      let profileRole: UserRole;

      if (existingProfile) {
        // Profile mavjud - faqat rolni tekshiramiz
        userId = existingProfile.id;
        profileRole = existingProfile.role as UserRole;
        
        toast({
          title: "Xush kelibsiz!",
          description: `Siz ${profileRole === 'teacher' ? 'O\'qituvchi' : 'Talaba'} sifatida tizimga kirdingiz`,
        });
      } else {
        // Yangi profile yaratish
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              telegram_user_id: telegramUser.id,
              full_name: fullName,
              role: role,
              avatar: telegramUser.photo_url || null,
            },
          ])
          .select("id, role")
          .single();

        if (insertError) throw insertError;
        if (!newProfile) throw new Error("Profile yaratilmadi");

        userId = newProfile.id;
        profileRole = role;

        toast({
          title: "Muvaffaqiyatli!",
          description: `Siz ${role === 'teacher' ? 'O\'qituvchi' : 'Talaba'} sifatida ro'yxatdan o'tdingiz`,
        });
      }

      // Auth store'ga saqlash
      setUser({
        id: userId,
        email: telegramUser.username || `telegram_${telegramUser.id}`,
        name: fullName,
        role: profileRole,
        profileUrl: telegramUser.photo_url || null,
      });

      // Dashboard'ga yo'naltirish
      navigate(profileRole === "teacher" ? "/teacher-dashboard" : "/student-dashboard");
    } catch (error: any) {
      console.error("Role selection error:", error);
      toast({
        title: "Xatolik",
        description: error.message || "Rolni saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!telegramUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card rounded-[2rem] p-8 shadow-soft text-center max-w-sm w-full animate-pulse">
           <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
           <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
           <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Decorative */}
       <div className="absolute top-0 w-full h-64 bg-primary-gradient rounded-b-[3rem] z-0" />

       <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-4 overflow-hidden">
             {telegramUser.photo_url ? (
               <img src={telegramUser.photo_url} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                 {telegramUser.first_name?.[0]}
               </div>
             )}
          </div>
          <h1 className="text-3xl font-black text-white mb-2 shadow-sm drop-shadow-md">
            Hi, {telegramUser.first_name}!
          </h1>
          <p className="text-white/80 font-medium text-lg">
            Choose your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Card */}
          <div
            className="card-modern bg-white cursor-pointer hover:shadow-2xl hover:-translate-y-2 group ring-2 ring-transparent hover:ring-primary transition-all duration-300"
            onClick={() => !isLoading && handleRoleSelect("teacher")}
          >
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <GraduationCap className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Teacher</h3>
              <p className="text-muted-foreground mb-6 text-sm px-4">
                Manage groups, assign tasks, and grade assignments effortlessly.
              </p>
              <Button 
                className="w-full rounded-xl py-6 text-base font-bold bg-indigo-50 text-indigo-700 hover:bg-primary hover:text-white transition-all shadow-none"
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Continue as Teacher"}
              </Button>
            </div>
          </div>

          {/* Student Card */}
          <div
            className="card-modern bg-white cursor-pointer hover:shadow-2xl hover:-translate-y-2 group ring-2 ring-transparent hover:ring-teal-500 transition-all duration-300"
            onClick={() => !isLoading && handleRoleSelect("student")}
          >
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                <Users className="w-10 h-10 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Student</h3>
              <p className="text-muted-foreground mb-6 text-sm px-4">
                Join study groups, submit tasks, and track your progress.
              </p>
              <Button 
                className="w-full rounded-xl py-6 text-base font-bold bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white transition-all shadow-none"
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Continue as Student"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
