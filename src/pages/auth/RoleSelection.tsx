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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yuklanmoqda...</CardTitle>
            <CardDescription>Telegram ma'lumotlari yuklanmoqda</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Xush kelibsiz, {telegramUser.first_name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Rolni tanlang va platformadan foydalanishni boshlang
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Card */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500"
            onClick={() => !isLoading && handleRoleSelect("teacher")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">O'qituvchi</CardTitle>
              <CardDescription className="text-base">
                Guruhlar yarating, topshiriqlar bering va talabalarni baholang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Guruhlar boshqaruvi
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Topshiriqlar yaratish
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Javoblarni baholash
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Statistika va hisobotlar
                </li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("teacher");
                }}
              >
                {isLoading ? "Yuklanmoqda..." : "O'qituvchi sifatida davom etish"}
              </Button>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-green-500"
            onClick={() => !isLoading && handleRoleSelect("student")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Talaba</CardTitle>
              <CardDescription className="text-base">
                Guruhlarga qo'shiling, topshiriqlarni bajaring va natijalarni ko'ring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Guruhlarga qo'shilish
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Topshiriqlarni bajarish
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Javoblarni yuklash
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Baholarni ko'rish
                </li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                variant="secondary"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("student");
                }}
              >
                {isLoading ? "Yuklanmoqda..." : "Talaba sifatida davom etish"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Telegram orqali avtomatik tizimga kirildi
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
