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
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setShowLanguageModal(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/role-selection');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-20 text-foreground"
      role="main"
      aria-labelledby="settings-title"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-accent rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('common.back')}
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <h1 id="settings-title" className="text-xl font-bold">{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="bg-card rounded-3xl p-6 shadow-sm border border-border cursor-pointer focus-within:ring-2 focus-within:ring-primary"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label={t('accessibility.open_profile')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
        >
          <div className="flex items-center gap-4">
            {profileUrl ? (
              <div className="relative">
                <img
                  src={profileUrl}
                  alt={name || 'User'}
                  className="w-16 h-16 rounded-full object-cover shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                  <Check className="w-3 h-3 text-white" aria-hidden="true" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  aria-hidden="true"
                >
                  {name?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                  <Check className="w-3 h-3 text-white" aria-hidden="true" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate">
                {name || t('auth.student')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('common.active')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
          {/* Language Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLanguageModal(true)}
            className="bg-card rounded-3xl p-6 shadow-sm border border-border cursor-pointer focus-within:ring-2 focus-within:ring-primary"
            role="button"
            tabIndex={0}
            aria-label={t('settings.language')}
            onKeyDown={(e) => e.key === 'Enter' && setShowLanguageModal(true)}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t('settings.language')}
            </p>
            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={t('settings.language')}>
              {languages.map((lang) => (
                <span
                  key={lang.code}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    selectedLanguage === lang.code
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  aria-current={selectedLanguage === lang.code ? 'true' : undefined}
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
            className="bg-card rounded-3xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                {isDarkMode ? (
                  <Moon className="w-6 h-6 text-purple-600" aria-hidden="true" />
                ) : (
                  <Sun className="w-6 h-6 text-purple-600" aria-hidden="true" />
                )}
              </div>
              <button
                onClick={handleThemeToggle}
                className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary ${
                  isDarkMode ? 'bg-primary' : 'bg-muted'
                }`}
                role="switch"
                aria-checked={isDarkMode}
                aria-label={isDarkMode ? t('settings.dark_mode') : t('settings.light_mode')}
              >
                <motion.div
                  animate={{ x: isDarkMode ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-6 h-6 bg-card rounded-full shadow-md"
                />
              </button>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
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
            className="bg-card rounded-3xl p-6 shadow-sm border border-border cursor-pointer focus-within:ring-2 focus-within:ring-primary"
            role="button"
            tabIndex={0}
            aria-label={t('accessibility.notifications')}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-orange-600" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t('accessibility.notifications')}
            </p>
            <h3 className="text-lg font-bold">{t('accessibility.notifications')}</h3>
          </motion.div>

          {/* Privacy Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card rounded-3xl p-6 shadow-sm border border-border cursor-pointer focus-within:ring-2 focus-within:ring-primary"
            role="button"
            tabIndex={0}
          >
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t('profile.role')}
            </p>
            <h3 className="text-lg font-bold">{t('profile.danger_zone')}</h3>
          </motion.div>
        </div>

        {/* Help Center */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-card rounded-3xl p-6 shadow-sm border border-border cursor-pointer focus-within:ring-2 focus-within:ring-primary"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{t('common.search')}</h3>
              <p className="text-sm text-muted-foreground">FAQs</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
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
            className="w-full h-14 rounded-3xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 font-semibold"
            aria-label={t('common.logout')}
          >
            <LogOut className="w-5 h-5 mr-2" aria-hidden="true" />
            {t('common.logout')}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 mx-4 mb-24 sm:mb-4 w-full sm:max-w-md shadow-2xl border border-border"
            >
              <h3 id="language-modal-title" className="text-xl font-bold mb-4">
                {t('settings.language')}
              </h3>
              <div className="space-y-3" role="radiogroup" aria-label={t('settings.language')}>
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      selectedLanguage === lang.code
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted border-2 border-transparent hover:bg-accent'
                    }`}
                    role="radio"
                    aria-checked={selectedLanguage === lang.code}
                  >
                    <span className="font-semibold text-foreground">
                      {lang.name}
                    </span>
                    {selectedLanguage === lang.code && (
                      <Check className="w-5 h-5 text-primary" aria-hidden="true" />
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
