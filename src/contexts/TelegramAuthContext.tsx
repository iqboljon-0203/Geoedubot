import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";
import { supabase } from "../lib/supabaseClient";
import { useTelegram } from "../hooks/useTelegram";

interface TelegramAuthContextType {
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export const useTelegramAuth = () => {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error("useTelegramAuth must be used within a TelegramAuthProvider");
  }
  return context;
};

export const TelegramAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, role, isLoading, setUser, setLoading, logout } = useAuthStore();
  const { user: telegramUser, isReady } = useTelegram();

  useEffect(() => {
    const checkAndBootstrap = async () => {
      // Supabase'ning eski auth sessiyalarini tozalash (xatolarni oldini olish uchun)
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[TelegramAuth] Clearing old session due to error:", error.message);
          await supabase.auth.signOut();
          localStorage.removeItem('sb-aubsdrqiorcbtcwurnsm-auth-token');
        }
      } catch (e) {
        // Ignore auth errors - we don't rely on Supabase Auth anymore
      }

      if (!isReady) return;
      
      setLoading(true);
      try {
        if (!telegramUser) {
          console.warn("[TelegramAuth] Telegram user topilmadi");
          setLoading(false);
          return;
        }

        console.log("[TelegramAuth] Telegram user:", telegramUser.id);

        // Telegram user ID asosida profile ni tekshirish
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, avatar, telegram_user_id")
          .eq("telegram_user_id", telegramUser.id)
          .maybeSingle();

        if (profileError) {
          console.error("[TelegramAuth] Profile olishda xato:", profileError);
          throw profileError;
        }

        if (profile) {
          // Profile mavjud - avtomatik login
          console.log("[TelegramAuth] Profile topildi:", profile.id);
          
          setUser({
            id: profile.id,
            email: telegramUser.username || `telegram_${telegramUser.id}`,
            name: profile.full_name,
            role: profile.role as UserRole,
            profileUrl: profile.avatar || telegramUser.photo_url || null,
          });

          // Agar auth sahifasida bo'lsa, dashboard'ga yo'naltirish
          if (window.location.pathname === "/role-selection" || window.location.pathname === "/") {
            navigate(
              profile.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard"
            );
          }
        } else {
          // Profile yo'q - rol tanlash sahifasiga yo'naltirish
          console.log("[TelegramAuth] Profile topilmadi, rol tanlashga yo'naltirish");
          if (!window.location.pathname.includes("/role-selection")) {
            navigate("/role-selection");
          }
        }
      } catch (error) {
        console.error("[TelegramAuth] Bootstrap xato:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAndBootstrap();
  }, [telegramUser, isReady, setUser, setLoading, navigate]);

  const signOut = async () => {
    try {
      logout();
      navigate("/role-selection");
      
      // Telegram WebApp'ni yopish
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close();
      }
    } catch (error) {
      console.error("[TelegramAuth] SignOut xato:", error);
      throw error;
    }
  };

  const value = {
    signOut,
    isLoading,
    isAuthenticated,
    role,
  };

  return (
    <TelegramAuthContext.Provider value={value}>
      {children}
    </TelegramAuthContext.Provider>
  );
};
