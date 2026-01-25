import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/role-selection');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6"
      role="status"
      aria-label={t('accessibility.loading_content')}
    >
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.8,
        }}
        className="mb-8"
      >
        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/30">
          <img src="/logo_white.png" alt="GeoEdubot Logo" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-4xl font-bold text-foreground mb-3 text-center"
      >
        GeoEducationbot
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-muted-foreground text-center max-w-sm px-4"
      >
        {t('splash.tagline')}
      </motion.p>
    </div>
  );
};

export default SplashScreen;
