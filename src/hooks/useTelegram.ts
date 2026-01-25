import { useEffect, useState } from 'react';
import type { TelegramUser, TelegramWebApp } from '@/types/telegram';

interface UseTelegramResult {
  user: TelegramUser | null;
  webApp: TelegramWebApp | null;
  isReady: boolean;
}

export function useTelegram(): UseTelegramResult {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const useTestUser = () => {
      setUser({
        id: 123456789,
        first_name: 'Test',
        last_name: 'Teacher',
        username: 'testteacher',
        language_code: 'uz',
        is_premium: true,
        photo_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
      setIsReady(true);
    };

    // Telegram WebApp SDK mavjudligini tekshirish
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      
      setWebApp(tg);
      
      // Telegram foydalanuvchi ma'lumotlarini olish
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
        setIsReady(true);
      } else {
        // WebApp bor, lekin user yo'q (Browserda script yuklangan holat)
        // Agar DEV mode bo'lsa, baribir test user ishlatamiz
        if (import.meta.env.DEV) {
          useTestUser();
        } else {
          setIsReady(true);
        }
      }
    } else {
      // SDK umuman yo'q
      if (import.meta.env.DEV) {
        useTestUser();
      } else {
        setIsReady(true);
      }
    }
  }, []);

  return { user, webApp, isReady };
}
