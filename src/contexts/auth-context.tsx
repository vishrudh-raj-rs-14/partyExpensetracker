import { createContext, useContext, useEffect, useState } from 'react'
import { account, ID } from '@/lib/appwrite'
import type { Models } from 'appwrite'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  loading: boolean
  signIn: (email: string, password?: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current session
    account
      .get()
      .then((user) => {
        setUser(user)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  const signIn = async (email: string, password?: string) => {
    if (!password) {
      throw new Error('Password is required for sign in')
    }
    try {
      await account.createEmailPasswordSession(email, password)
      const user = await account.get()
      setUser(user)
    } catch (error: any) {
      // Handle "session already exists" error - logout and try again
      if (
        error.message?.toLowerCase().includes('session') ||
        error.message?.toLowerCase().includes('already exists') ||
        error.code === 409 ||
        (error.code === 401 && error.message?.toLowerCase().includes('session'))
      ) {
        try {
          // Delete all sessions and try again
          // Try deleteSessions first, fallback to deleteSession('current')
          try {
            if (typeof (account as any).deleteSessions === 'function') {
              await (account as any).deleteSessions()
            } else {
              await account.deleteSession('current')
            }
          } catch (deleteError) {
            // Ignore delete errors, just try to create new session
          }
          // Retry creating session
          await account.createEmailPasswordSession(email, password)
          const user = await account.get()
          setUser(user)
          return
        } catch (retryError: any) {
          // If retry fails, throw the original error
          throw error
        }
      }
      // Handle network/CORS errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.type === 'network') {
        throw new Error('Network error: Please check your Appwrite CORS settings. Add your Vercel domain to allowed origins in Appwrite Settings → Platforms.')
      }
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password)
      // Try to create session - if email verification is required, this will fail
      // In that case, user needs to verify email first
      try {
        await account.createEmailPasswordSession(email, password)
        const user = await account.get()
        setUser(user)
      } catch (error: any) {
        // If session creation fails due to unverified email, throw a helpful error
        if (error.code === 401 || error.message?.includes('verif')) {
          throw new Error('Please verify your email address. Check your inbox for a verification email.')
        }
        throw error
      }
    } catch (error: any) {
      // Handle network/CORS errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.type === 'network') {
        throw new Error('Network error: Please check your Appwrite CORS settings. Add your Vercel domain to allowed origins in Appwrite Settings → Platforms.')
      }
      throw error
    }
  }

  const sendMagicLink = async (email: string) => {
    // Create magic URL token for passwordless login
    // Note: Method name may vary by Appwrite SDK version
    try {
      // Try the newer method name first
      if (typeof (account as any).createMagicURLToken === 'function') {
        await (account as any).createMagicURLToken(ID.unique(), email, `${window.location.origin}/login`)
      } else if (typeof (account as any).createMagicURLSession === 'function') {
        await (account as any).createMagicURLSession(ID.unique(), email, `${window.location.origin}/login`)
      } else {
        throw new Error('Magic URL method not available in this Appwrite SDK version')
      }
    } catch (error: any) {
      // If magic URL fails, throw a helpful error
      throw new Error(error.message || 'Failed to send magic link. Please use email/password login instead.')
    }
  }

  const signOut = async () => {
    await account.deleteSession('current')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, sendMagicLink }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
