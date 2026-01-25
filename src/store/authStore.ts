import { create } from "zustand";
import { UserRole } from "../types";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  role: UserRole | null;
  profileUrl: string | null;
  isLoading: boolean;

  // Actions
  setUser: (user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    profileUrl?: string | null;
  }) => void;
  setLoading: (isLoading: boolean) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: null,
  email: null,
  name: null,
  role: null,
  profileUrl: null,
  isLoading: true,

  setUser: (user) => {
    localStorage.setItem("hamkor_user", JSON.stringify(user));
    set({
      isAuthenticated: true,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileUrl: user.profileUrl || null,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setRole: (role) => {
    set((state) => {
      const updatedUser = {
        id: state.userId || '',
        email: state.email || '',
        name: state.name || '',
        role: role,
        profileUrl: state.profileUrl,
      };
      
      localStorage.setItem("hamkor_user", JSON.stringify(updatedUser));
      
      return { role };
    });
  },

  logout: () => {
    localStorage.removeItem("hamkor_user");
    localStorage.removeItem("hamkor_password");
    set({
      isAuthenticated: false,
      userId: null,
      email: null,
      name: null,
      role: null,
      profileUrl: null,
      isLoading: false,
    });
  },
}));
