import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/role-selection');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 flex flex-col items-center justify-center p-6">
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
        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <GraduationCap className="w-16 h-16 text-white" strokeWidth={2} />
        </div>
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-4xl font-bold text-zinc-900 mb-3 text-center"
      >
        GeoEducationbot
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-zinc-600 text-center max-w-sm mb-16"
      >
        Explore the world, one lesson at a time
      </motion.p>

      {/* Loading Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-64"
      >
        <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-zinc-500 text-center mt-4"
        >
          LOADING
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
