import { create } from 'zustand'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('admin_token'),
  isLoading: true,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.user.role !== 'admin') {
      throw new Error('Access denied. Admin accounts only.')
    }
    localStorage.setItem('admin_token', data.access_token)
    set({ user: data.user, token: data.access_token })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    set({ user: null, token: null })
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        set({ isLoading: false })
        return
      }
      const { data } = await api.get('/auth/me')
      if (data.role !== 'admin') {
        localStorage.removeItem('admin_token')
        set({ user: null, token: null, isLoading: false })
        return
      }
      set({ user: data, token, isLoading: false })
    } catch {
      localStorage.removeItem('admin_token')
      set({ user: null, token: null, isLoading: false })
    }
  },
}))