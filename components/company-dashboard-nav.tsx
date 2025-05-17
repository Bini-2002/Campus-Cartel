"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Briefcase, Building, FileText, Home, LogOut, MessageSquare, Settings, Users } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CompanyDashboardNav() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await api.getProfile()
        setProfile(profileData)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }

    fetchProfile()
  }, [])

  const navItems = [
    { href: "/company-dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/company-dashboard/jobs", label: "Job Listings", icon: <Briefcase className="h-5 w-5" /> },
    { href: "/company-dashboard/applications", label: "Applications", icon: <FileText className="h-5 w-5" /> },
    { href: "/company-dashboard/talent", label: "Talent Pool", icon: <Users className="h-5 w-5" /> },
    { href: "/company-dashboard/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/company-dashboard/profile", label: "Company Profile", icon: <Building className="h-5 w-5" /> },
    { href: "/company-dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-y-auto hidden md:block">
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center">
          <img src="/sidebar-logo.png" alt="CampusCraft Logo" className="h-29 w-48" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white"></span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                asChild
              >
                <div>
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 mt-auto border-t border-gray-200 dark:border-gray-700 absolute bottom-0 w-full bg-white dark:bg-gray-900">
        {profile && (
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {profile.profile_image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profile_image}`}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile.company_name || "Company"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.industry || "Industry"}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Logout</span>
        </Button>
      </div>
    </div>
  )
}
