"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredUserType?: "student" | "company"
}

export default function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (requiredUserType && user.userType !== requiredUserType) {
        // Redirect to appropriate dashboard
        if (user.userType === "student") {
          router.push("/dashboard")
        } else {
          router.push("/company-dashboard")
        }
        return
      }
    }
  }, [user, loading, requiredUserType, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user || (requiredUserType && user.userType !== requiredUserType)) {
    return null
  }

  return <>{children}</>
}
