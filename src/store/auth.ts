import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Address, SavedDesign, StyleProfile } from '../types'

// Mock auth: a fully client-side simulation with OTP. In production the
// verify()/login() calls would hit a real auth API; the UI contract stays
// identical. Passwords are never stored in plaintext beyond this demo shim.

interface AuthState {
  user: User | null
  // pending OTP (demo): the code is surfaced in the UI as a hint
  pendingOtp: string | null
  designs: SavedDesign[]

  startOtp: (phone: string) => string
  verifyOtp: (code: string, profile: { name?: string; phone: string; email?: string }) => boolean
  loginEmail: (email: string, _password: string, name?: string) => boolean
  signOut: () => void

  addAddress: (a: Omit<Address, 'id'>) => void
  removeAddress: (id: string) => void
  setStyleProfile: (p: StyleProfile) => void
  addPoints: (n: number) => void

  saveDesign: (d: SavedDesign) => void
  removeDesign: (id: string) => void
}

function makeUser(partial: Partial<User> & { phone: string; name: string }): User {
  return {
    id: `u-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    addresses: [],
    rewardPoints: 120,
    tier: 'Explorer',
    ...partial,
    name: partial.name,
    phone: partial.phone,
  }
}

// Deterministic demo OTP so it's testable without an SMS provider.
function genOtp(phone: string): string {
  let h = 0
  for (const ch of phone) h = (h * 31 + ch.charCodeAt(0)) % 1000000
  return (100000 + (h % 900000)).toString()
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      pendingOtp: null,
      designs: [],

      startOtp: (phone) => {
        const code = genOtp(phone)
        set({ pendingOtp: code })
        return code
      },
      verifyOtp: (code, profile) => {
        if (code !== get().pendingOtp) return false
        const existing = get().user
        set({
          user: existing ?? makeUser({ name: profile.name || 'AEON Member', phone: profile.phone, email: profile.email }),
          pendingOtp: null,
        })
        return true
      },
      loginEmail: (email, _password, name) => {
        set({ user: makeUser({ name: name || email.split('@')[0], phone: '', email }) })
        return true
      },
      signOut: () => set({ user: null, pendingOtp: null }),

      addAddress: (a) =>
        set((s) => {
          if (!s.user) return s
          const addr: Address = { ...a, id: `addr-${Date.now().toString(36)}` }
          return { user: { ...s.user, addresses: [...s.user.addresses, addr] } }
        }),
      removeAddress: (id) =>
        set((s) => (s.user ? { user: { ...s.user, addresses: s.user.addresses.filter((x) => x.id !== id) } } : s)),
      setStyleProfile: (p) => set((s) => (s.user ? { user: { ...s.user, styleProfile: p } } : { user: makeUser({ name: 'AEON Member', phone: '' , styleProfile: p }) })),
      addPoints: (n) => set((s) => (s.user ? { user: { ...s.user, rewardPoints: s.user.rewardPoints + n } } : s)),

      saveDesign: (d) => set((s) => ({ designs: [d, ...s.designs.filter((x) => x.id !== d.id)] })),
      removeDesign: (id) => set((s) => ({ designs: s.designs.filter((x) => x.id !== id) })),
    }),
    { name: 'aeon.auth' }
  )
)
