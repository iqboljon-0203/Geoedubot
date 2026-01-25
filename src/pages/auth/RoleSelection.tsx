import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, BookOpen, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setRole, setUser, isAuthenticated, role } = useAuthStore();
  const { t } = useTranslation();
  const { user: telegramUser } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);

  // Agar user allaqachon tizimga kirgan bo'lsa, uni yo'naltiramiz
  useEffect(() => {
    if (isAuthenticated && role) {
      const path = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Rol tanlanganda profil yaratish va saqlash
  const handleRoleSelect = async (selectedRole: 'teacher' | 'student') => {
    // Agar Telegram user bo'lmasa (dev mode), oddiygina lokal store'ga yozib ketamiz
    if (!telegramUser) {
      setRole(selectedRole); // Faqat rol o'rnatiladi
      const path = selectedRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(path);
      return;
    }

    setIsLoading(true);
    try {
      const newProfile = {
        telegram_user_id: telegramUser.id,
        full_name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' '),
        role: selectedRole,
        avatar: telegramUser.photo_url || null, // Bu yerda Telegram rasmi olinadi
        updated_at: new Date().toISOString(),
      };

      // 5 soniyalik timeout qo'yamiz, agar internet sekin bo'lsa kutib o'tirmaslik uchun
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const dbPromise = supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'telegram_user_id' })
        .select()
        .single();

      // Race condition: database yoki timeout
      const result: any = await Promise.race([dbPromise, timeoutPromise]);
      const { data, error } = result;

      if (error) throw error;

      if (data) {
        // Store'ni yangilash
        setUser({
          id: data.id,
          email: telegramUser.username || `telegram_${telegramUser.id}`,
          name: data.full_name,
          role: data.role as 'teacher' | 'student',
          profileUrl: data.avatar, // Bazadagi rasm (Telegramdan olingan)
        });
        localStorage.removeItem('manual_logout');

        const path = selectedRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
        navigate(path);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      // Xato bo'lsa yoki timeout bo'lsa ham, foydalanuvchini kuttirmasdan o'tkazamiz
      // Faqat lokal saqlab turamiz
      setRole(selectedRole);
      
      // Fallback user data
      setUser({
        id: telegramUser.id.toString(),
        email: telegramUser.username || `telegram_${telegramUser.id}`,
        name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' '),
        role: selectedRole,
        profileUrl: telegramUser.photo_url || null,
      });
      localStorage.removeItem('manual_logout');

      const path = selectedRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(path);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'teacher',
      title: t('auth.teacher'),
      description: t('auth.teacher_desc'),
      icon: GraduationCap,
      gradient: 'from-primary to-blue-600',
    },
    {
      id: 'student',
      title: t('auth.student'),
      description: t('auth.student_desc'),
      icon: BookOpen,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col items-center justify-center p-6"
      role="main"
      aria-labelledby="role-selection-title"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg shadow-primary/20">
          <img src="/logo_white.png" alt="GeoEdubot Logo" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 
          id="role-selection-title"
          className="text-3xl font-bold text-foreground mb-2"
        >
          {t('auth.select_role')}
        </h1>
      </motion.div>

      {/* Role Cards */}
      <div 
        className="w-full max-w-md space-y-4 mb-8"
        role="group"
        aria-label={t('auth.select_role')}
      >
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <motion.button
              key={role.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect(role.id as 'teacher' | 'student')}
              disabled={isLoading} // Loading paytida bosib bo'lmaydi
              className={`relative w-full text-left bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              aria-label={`${role.title}: ${role.description}`}
            >
              {/* Arrow Icon */}
              <motion.div
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
                aria-hidden="true"
              >
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>

              <div className="flex items-start gap-4">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                  aria-hidden="true"
                >
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Step Indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-muted-foreground uppercase tracking-wider mb-8"
        aria-live="polite"
      >
        {t('auth.step_of', { current: 1, total: 3 })}
      </motion.p>

    </div>
  );
};

export default RoleSelection;
