import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();
  const { t } = useTranslation();

  // TEMPORARY: Auto-redirect removed
  // useEffect logic was here

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setRole(role);
    const path = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
    navigate(path);
  };

  const roles = [
    {
      id: 'teacher',
      title: t('auth.teacher'),
      description: t('auth.teacher_desc'),
      icon: GraduationCap,
      gradient: 'from-blue-500 to-blue-600',
      languages: ['UZ', 'RU', 'ENG'],
    },
    {
      id: 'student',
      title: t('auth.student'),
      description: t('auth.student_desc'),
      icon: BookOpen,
      gradient: 'from-purple-500 to-purple-600',
      languages: ['UZ', 'RU', 'ENG'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 dark:from-black dark:to-zinc-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <GraduationCap className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          {t('auth.select_role')}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
           
        </p>
      </motion.div>

      {/* Role Cards */}
      <div className="w-full max-w-md space-y-4 mb-8">
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={role.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect(role.id as 'teacher' | 'student')}
              className="relative bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800 hover:shadow-xl hover:border-zinc-300/60 transition-all cursor-pointer group"
            >
              {/* Arrow Icon */}
              <motion.div
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <svg
                  className="w-6 h-6 text-zinc-400"
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
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Language Tags - Removed as it is redundant now that we have app-wide language */}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Step Indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-zinc-500 uppercase tracking-wider"
      >
        STEP 1 OF 3
      </motion.p>
    </div>
  );
};

export default RoleSelection;
