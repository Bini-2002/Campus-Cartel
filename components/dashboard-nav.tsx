"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { Home, FolderOpen, Briefcase, Users, MessageSquare, User, LogOut, GraduationCap, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { api, type User as UserType } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Opportunities", href: "/dashboard/opportunities", icon: Briefcase },
  { name: "Network", href: "/dashboard/network", icon: Users },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserType | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await api.getProfile()
        setProfile(profileData)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center">
          <img src="/sidebar-logo.png" alt="CampusCraft Logo" className="h-29 w-48" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white"></span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profileImage}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {profile?.firstName && profile?.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : user?.email || "User"}
            </p>
            {profile?.university && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center">
                <GraduationCap className="h-3 w-3 mr-1" />
                {profile.university}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
