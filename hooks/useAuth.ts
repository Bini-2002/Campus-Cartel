"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, type User } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, userType: "student" | "company") => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  verifyAccount: (email: string, code: string, userType: "student" | "company") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = api.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, userType: "student" | "company") => {
    try {
      const response = await api.login({ email, password, userType })

      // Check if the account is verified
      if (!response.user.isVerified) {
        throw new Error("Account not verified. Please check your email for verification instructions.")
      }

      setUser(response.user)

      // Redirect based on user type
      if (userType === "student") {
        router.push("/dashboard")
      } else {
        router.push("/company-dashboard")
      }
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await api.register(userData)

      // Don't set user or redirect here - let the registration page handle verification flow
      return response
    } catch (error) {
      throw error
    }
  }

  const verifyAccount = async (email: string, code: string, userType: "student" | "company") => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code, userType }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Verification failed")
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    api.logout()
    setUser(null)
    router.push("/")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, verifyAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
