import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Compass, ArrowRight, ShieldCheck, MapPin, Activity, Badge, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabaseClient';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setRole, setUser, isAuthenticated, role } = useAuthStore();
  const { t } = useTranslation();
  const { user: telegramUser } = useTelegram();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role) {
      const path = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleRoleSelect = async (selectedRole: 'teacher' | 'student') => {
    setIsLoading(selectedRole);
    try {
      if (!telegramUser) {
        setRole(selectedRole);
        const path = selectedRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
        navigate(path);
        return;
      }

      const newProfile = {
        telegram_user_id: telegramUser.id,
        full_name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' '),
        role: selectedRole,
        avatar: telegramUser.photo_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'telegram_user_id' })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: telegramUser.username || `telegram_${telegramUser.id}`,
          name: data.full_name,
          role: data.role as 'teacher' | 'student',
          profileUrl: data.avatar,
        });
        localStorage.removeItem('manual_logout');
        navigate(selectedRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setRole(selectedRole);
      navigate(selectedRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center pt-8 pb-12 px-4 relative overflow-hidden font-['Outfit']">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

      {/* Top Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#00A87A] flex items-center justify-center shadow-lg shadow-green-500/20 mb-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
             <MapPin className="w-5 h-5 text-[#00A87A]" fill="currentColor" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-100/50">
          <Compass className="w-3.5 h-3.5" />
          GeoEducation TWA v2.4
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Xush kelibsiz!</h1>
        <p className="text-slate-500 text-sm max-w-[260px] mx-auto leading-relaxed">
          Davom etish uchun tizimdagi rolingizni tanlang
        </p>
      </motion.div>

      {/* Cards Container */}
      <div className="w-full max-w-sm space-y-4 relative z-10 flex-1">
        
        {/* Teacher Card */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E1F7EE] rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#5EEDBA] flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6 text-slate-900" />
            </div>
            <span className="bg-[#BFF5E0] text-[#006644] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Tashkilotchi & Mentor
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Men O'qituvchiman</h2>
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            Guruhlar oching, geo-lokatsiyali amaliyotlar bering va talabalar javoblarini xaritada tekshiring.
          </p>

          <div className="flex gap-2 mb-6">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600">
              <MapPin className="w-3.5 h-3.5" /> Geo-topshiriq
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600">
              <Activity className="w-3.5 h-3.5" /> Jonli monitoring
            </div>
          </div>

          <button
            onClick={() => handleRoleSelect('teacher')}
            disabled={isLoading !== null}
            className="w-full bg-[#006C4A] hover:bg-[#00573B] text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoading === 'teacher' ? 'Yuklanmoqda...' : "O'qituvchi sifatida kirish"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Student Card */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBF4FF] rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#CDE0FF] flex items-center justify-center shadow-sm">
              <Compass className="w-6 h-6 text-slate-900" />
            </div>
            <span className="bg-[#E0EFFF] text-[#004BB3] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              O'rganuvchi & Izlanuvchi
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Men Talabaman</h2>
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            Guruhlarga kod orqali qo'shiling, geo-topshiriqlarni joyida yeching va o'z reytingingizni oshiring.
          </p>

          <div className="flex gap-2 mb-6">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600">
              <Navigation className="w-3.5 h-3.5" /> Joyida tekshiruv
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600">
              <Badge className="w-3.5 h-3.5" /> +150 XP & Badj
            </div>
          </div>

          <button
            onClick={() => handleRoleSelect('student')}
            disabled={isLoading !== null}
            className="w-full bg-[#005FB8] hover:bg-[#004B91] text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoading === 'student' ? 'Yuklanmoqda...' : 'Talaba sifatida kirish'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <div className="flex items-center justify-center gap-1.5 text-slate-700 font-medium mb-1">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          Telegram OAuth 2.0
        </div>
        <p className="text-slate-400 text-xs mb-6">
          Ro'yxatdan o'tish Telegram hisobingiz orqali<br/>avtomatik amalga oshiriladi
        </p>

        <div className="inline-flex items-center gap-2 bg-blue-50/50 border border-blue-100 text-slate-600 px-4 py-2 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#00D287] animate-pulse"></span>
          GPS faol: Toshkent zonasi tayyor
        </div>
      </motion.div>

    </div>
  );
};

export default RoleSelection;
