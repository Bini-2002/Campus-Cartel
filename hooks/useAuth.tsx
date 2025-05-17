"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode, type JSX } from "react"
import { api, type User } from "../lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, userType: "student" | "company") => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }): React.ReactNode {
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
      setUser(response.user)

      // Redirect based on user type
      if (userData.userType === "student") {
        router.push("/dashboard")
      } else {
        router.push("/company-dashboard")
      }
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
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
