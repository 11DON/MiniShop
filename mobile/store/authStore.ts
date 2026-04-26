import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    await SecureStore.setItemAsync("access_token", data.access_token);
    set({ user: data.user, token: data.access_token });
  },

  register: async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
    // Auto login after register
    const { data } = await api.post("/auth/login", { email, password });
    await SecureStore.setItemAsync("access_token", data.access_token);
    set({ user: data.user, token: data.access_token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("access_token");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get("/auth/me");
      set({ user: data, token, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync("access_token");
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
