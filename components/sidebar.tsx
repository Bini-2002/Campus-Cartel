"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Briefcase, Building, Code, FileText, Home, LogOut, MessageSquare, Settings, Users, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { api, type User as UserType } from "@/lib/api"

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserType | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const profileData = await api.getProfile()
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }

    fetchProfile()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const studentNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/projects", label: "Projects", icon: <Code className="h-5 w-5" /> },
    { href: "/dashboard/opportunities", label: "Opportunities", icon: <Briefcase className="h-5 w-5" /> },
    { href: "/dashboard/network", label: "Network", icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/dashboard/profile", label: "Profile", icon: <FileText className="h-5 w-5" /> },
    { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const companyNavItems = [
    { href: "/company-dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/company-dashboard/jobs", label: "Job Listings", icon: <Briefcase className="h-5 w-5" /> },
    { href: "/company-dashboard/applications", label: "Applications", icon: <FileText className="h-5 w-5" /> },
    { href: "/company-dashboard/talent", label: "Talent Pool", icon: <Users className="h-5 w-5" /> },
    { href: "/company-dashboard/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/company-dashboard/profile", label: "Company Profile", icon: <Building className="h-5 w-5" /> },
    { href: "/company-dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const navItems = user?.userType === "company" ? companyNavItems : studentNavItems

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-3">
            <Link href="/" className="flex items-center justify-center">
              <img
                src={"/sidebar-logo.png"}
                alt="CampusCraft"
                className="h-14 w-full max-w-[200px] object-contain scale-110"
                onError={(e) => {
                  console.error('Failed to load sidebar logo');
                  e.currentTarget.src = '/placeholder-logo.png';
                }}
              />
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="p-4 border-t">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile?.profileImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.firstName && profile?.lastName
                        ? `${profile.firstName} ${profile.lastName}`
                        : profile?.companyName || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.userType === "student" ? profile?.university : "Company"}
                    </p>
                  </div>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
