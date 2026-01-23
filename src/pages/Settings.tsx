import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  Moon, 
  Sun,
  Bell, 
  Shield, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Check
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

type Language = 'uz' | 'en' | 'ru';

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useTelegramAuth();
  const { name, profileUrl } = useAuthStore();
  const { t, i18n } = useTranslation();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Initialize lang from i18n
  const [selectedLanguage, setSelectedLanguage] = useState<Language>((i18n.language as Language) || 'uz');

  useEffect(() => {
    // Check dark mode
    if (document.documentElement.classList.contains('dark')) {
        setIsDarkMode(true);
    }
    // Update state if i18n language changes externally or on load
    setSelectedLanguage((i18n.language as Language) || 'uz');
  }, [i18n.language]);

  const languages: { code: Language; name: string }[] = [
    { code: 'uz', name: "O'zbekcha" },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
  ];

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 dark:from-black dark:to-zinc-900 pb-20 text-zinc-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </motion.button>
            <h1 className="text-xl font-bold">{t('settings.title')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800 cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <div className="flex items-center gap-4">
            {profileUrl ? (
              <div className="relative">
                <img
                  src={profileUrl}
                  alt={name || 'User'}
                  className="w-16 h-16 rounded-full object-cover shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {name?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate">
                {name || 'Student'}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Premium Member</p>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLanguageModal(true)}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              {t('settings.language')}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {languages.map((lang) => (
                <span
                  key={lang.code}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    selectedLanguage === lang.code
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {lang.code.toUpperCase()}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Dark Mode Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                {isDarkMode ? (
                  <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Sun className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleThemeToggle}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  isDarkMode ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <motion.div
                  animate={{ x: isDarkMode ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              {t('settings.theme')}
            </p>
            <h3 className="text-lg font-bold">
               {isDarkMode ? t('settings.dark_mode') : t('settings.light_mode')}
            </h3>
          </motion.div>

          {/* Notifications Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              ALERTS
            </p>
            <h3 className="text-lg font-bold">Notifications</h3>
          </motion.div>

          {/* Privacy Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              SECURITY
            </p>
            <h3 className="text-lg font-bold">Privacy</h3>
          </motion.div>
        </div>

        {/* Help Center */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200/60 dark:border-zinc-800 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Help Center</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">FAQs and Support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            onClick={handleLogout}
            className="w-full h-14 rounded-3xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/30 font-semibold"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t('common.error').includes('error') ? 'Log Out' : t('common.error') === 'Xatolik yuz berdi' ? 'Chiqish' : 'Log Out'} {/* Temporary fallback logic, better to use t('auth.logout') but I didn't add it. Using hardcoded for now or add to json */}
            Log Out
          </Button>
        </motion.div>
      </div>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLanguageModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="text-xl font-bold mb-4">
                {t('settings.language')}
              </h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-600 dark:border-blue-500'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span className="font-semibold">
                      {lang.name}
                    </span>
                    {selectedLanguage === lang.code && (
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
